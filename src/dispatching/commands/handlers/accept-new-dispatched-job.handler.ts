import { ICommandHandler, CommandHandler, QueryBus, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Equal, Not, getCustomRepository } from 'typeorm';
import { ServiceRequestAllocatedEvent, ServiceRequestAssignedEvent } from '@cqrs/events/service-request.event';
import {
    EntityNotFoundError,
    FailToAcceptJobDueToFullyOccupiedWorkersError,
    FailToAcceptJobDueToOverlappingAppointmentError,
    UnauthorizedError,
} from '@shared/errors';
import { ServiceRequest } from '@service-request/entities/service-request.entity';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { GetServiceRequestQuery } from '@service-request/queries/get-service-request.query';
import { UserStatus } from '../../../shared/enums';
import { AcceptNewDispatchedJobCommand } from '../accept-new-dispatched-job.command';
import { JobDtoFactory } from 'dispatching/dto/factories/job.dto.factory';
import { JobDto } from 'dispatching/dto/job.dto';
import { Appointment } from 'dispatching/entities/appointment.entity';
import { Assignment } from 'dispatching/entities/assignment.entity';
import { AppointmentFactory } from 'dispatching/entities/factories/appointment.factory';
import { AssignmentStatusEnum } from 'dispatching/enums/assignment-status.enum';
import { GetWorkersOfDealerQuery } from 'dispatching/queries/get-workers-of-dealer.query';
import { AppointmentRepository } from 'dispatching/repository/appointment.repository';
import { IServiceProvider } from 'service-provider/interfaces/service-provider.interface';
import { GetServiceProviderQuery } from 'service-provider/queries/get-service-provider.query';
import { ServiceProvider } from 'service-provider/service-provider.entity';

@CommandHandler(AcceptNewDispatchedJobCommand)
export class AcceptNewDispatchedJobHandler implements ICommandHandler<AcceptNewDispatchedJobCommand> {
    constructor(
        private readonly eventBus: EventBus,
        @InjectRepository(Appointment) private readonly allocationRepository: Repository<Appointment>,

        @InjectRepository(Assignment) private readonly assignmentRepository: Repository<Assignment>,
        private readonly queryBus: QueryBus,
        // refactor(roy): if possible, do not import service-request-repo
        @InjectRepository(ServiceRequest) private readonly serviceRequestRepository: Repository<ServiceRequest>,
    ) {}

    // refactor(roy): should i impose logic that one cannot accept a job that he didn't dispatched to?
    // refactor(roy): should i impose logic that one cannot accept an expired job?
    async execute(command: AcceptNewDispatchedJobCommand): Promise<JobDto> {
        const { providerId, serviceRequestId } = command;

        // todo(roy): handle racy-accept
        const serviceRequest: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(serviceRequestId));
        if (!serviceRequest) {
            throw new EntityNotFoundError('ServiceRequest', serviceRequestId);
        }

        const serviceProvider: IServiceProvider = await this.queryBus.execute(new GetServiceProviderQuery(providerId));
        if (!serviceProvider) {
            throw new EntityNotFoundError('ServiceProvider', providerId);
        }

        if (serviceProvider.toDto().generalStatus !== UserStatus.ACTIVE) {
            throw new UnauthorizedError();
        }

        if (serviceProvider.isDealer()) {
            // refactor(roy): refer to IServiceProvider instead
            const availableWorkers: ServiceProvider[] = await this.queryBus.execute(
                new GetWorkersOfDealerQuery(serviceProvider.getId(), serviceRequest.getId()),
            );

            if (availableWorkers.length < 1) {
                throw new FailToAcceptJobDueToFullyOccupiedWorkersError(
                    serviceRequest.serviceSchedule().getLocalStartDateString(),
                    serviceRequest.serviceSchedule().getLocalEndDateString(),
                );
            }
        } else {
            const appointmentRepo = getCustomRepository(AppointmentRepository);
            const [overlappedAppointment] = await appointmentRepo.findOverlappingAllocatedAppointmentsOfWorkers(
                [serviceProvider],
                serviceRequest.serviceSchedule(),
            );

            if (overlappedAppointment) {
                throw new FailToAcceptJobDueToOverlappingAppointmentError(
                    overlappedAppointment.serviceRequestId,
                    overlappedAppointment.serviceSchedule().getLocalStartDateString(),
                    overlappedAppointment.serviceSchedule().getLocalEndDateString(),
                );
            }
        }

        serviceRequest.assignToDispatcher(serviceProvider);
        serviceRequest.beforeSave();
        await this.serviceRequestRepository.save(serviceRequest);
        await this.assignmentRepository.update(
            {
                serviceRequestId,
                providerId,
                status: Equal(AssignmentStatusEnum.PENDING),
            },
            { status: AssignmentStatusEnum.ACCEPTED },
        );

        await this.assignmentRepository.update(
            {
                serviceRequestId,
                providerId: Not(providerId),
            },
            { status: AssignmentStatusEnum.FAILED },
        );

        this.eventBus.publish(new ServiceRequestAssignedEvent(serviceRequest));
        if (serviceRequest.isAllocatedTo(providerId)) {
            await this.allocationRepository.save(AppointmentFactory.create(serviceRequest));
            this.eventBus.publish(new ServiceRequestAllocatedEvent(serviceRequest));
        }

        return JobDtoFactory.create(serviceRequest);
    }
}
