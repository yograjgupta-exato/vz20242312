import { ICommandHandler, CommandHandler, QueryBus, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Equal, getCustomRepository } from 'typeorm';
import { ServiceRequestAllocatedEvent, ServiceRequestAssignedEvent } from '@cqrs/events/service-request.event';
import {
    EntityNotFoundError,
    FailToManuallyAssignDealerDueToFullyOccupiedWorkersError,
    FailToManuallyAssignIndependentContractorDueToOverlappingAppointmentError,
} from '@shared/errors';
import { ServiceRequest } from '@service-request/entities/service-request.entity';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { GetServiceRequestQuery } from '@service-request/queries/get-service-request.query';
import { AssignmentInput } from '../../dto/assignment.input';
import { Appointment } from '../../entities/appointment.entity';
import { Assignment } from '../../entities/assignment.entity';
import { AppointmentFactory } from '../../entities/factories/appointment.factory';
import { AssignmentFactory } from '../../entities/factories/assignment.factory';
import { AssignmentStatusEnum } from '../../enums/assignment-status.enum';
import { AutoAssignmentTypeEnum } from '../../enums/auto-assignment-type.enum';
import { ManuallyAssignJobToProviderCommand } from '../manually-assign-job-to-provider.command';
import { GetWorkersOfDealerQuery } from 'dispatching/queries/get-workers-of-dealer.query';
import { AppointmentRepository } from 'dispatching/repository/appointment.repository';
import { ServiceProvider } from 'service-provider/service-provider.entity';

@CommandHandler(ManuallyAssignJobToProviderCommand)
export class ManuallyAssignJobToProviderHandler implements ICommandHandler<ManuallyAssignJobToProviderCommand> {
    constructor(
        private readonly eventBus: EventBus,
        @InjectRepository(Appointment) private readonly allocationRepository: Repository<Appointment>,
        @InjectRepository(Assignment) private readonly assignmentRepository: Repository<Assignment>,
        private readonly queryBus: QueryBus,
        @InjectRepository(ServiceProvider) private readonly serviceProviderRepository: Repository<ServiceProvider>,

        // refactor(roy): if possible, do not import service-request-repo
        @InjectRepository(ServiceRequest) private readonly serviceRequestRepository: Repository<ServiceRequest>,
    ) {}

    // refactor(roy): 98% logics here are duplicated as
    // `commands/handlers/AcceptNewDispatchedJobHandler`
    // except it doesn't need to validate if this job has been dispatched to in the
    // first place.
    async execute(command: ManuallyAssignJobToProviderCommand): Promise<IServiceRequest> {
        const { providerId, serviceRequestId } = command;

        if (!providerId || !serviceRequestId) {
            throw new Error(`Missing Data: providerId=${providerId} or serviceRequestId=${serviceRequestId}`);
        }

        const serviceRequest: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(serviceRequestId));
        if (!serviceRequest) {
            throw new EntityNotFoundError('ServiceRequest', serviceRequestId);
        }

        const serviceProvider = await this.serviceProviderRepository.findOne(providerId);
        if (!serviceProvider) {
            throw new EntityNotFoundError('ServiceProvider', providerId);
        }

        if (serviceProvider.isDealer()) {
            const availableWorkers: ServiceProvider[] = await this.queryBus.execute(
                new GetWorkersOfDealerQuery(serviceProvider.getId(), serviceRequest.getId()),
            );

            if (availableWorkers.length < 1) {
                throw new FailToManuallyAssignDealerDueToFullyOccupiedWorkersError(
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
                throw new FailToManuallyAssignIndependentContractorDueToOverlappingAppointmentError(
                    overlappedAppointment.serviceRequestId,
                    overlappedAppointment.serviceSchedule().getLocalStartDateString(),
                    overlappedAppointment.serviceSchedule().getLocalEndDateString(),
                );
            }
        }

        serviceRequest.assignToDispatcher(serviceProvider);
        serviceRequest.beforeSave();
        await this.serviceRequestRepository.save(serviceRequest);

        // note(roy): here is the different bit from accept-new-dispatched-job handler...
        // we need to insert if not exist, and update if exists.

        // issue(roy): typeorm doesn't support upsert just yet
        // https://github.com/typeorm/typeorm/issues/1090

        // refactor(roy): should we update if he/she has been dispatched to?
        // right now we ignore.
        const di = new AssignmentInput();
        di.providerId = providerId;
        di.requestSeconds = 0;
        di.serviceRequestId = serviceRequestId;
        di.assignmentType = AutoAssignmentTypeEnum.MANUAL;

        const assignment = AssignmentFactory.create(di);
        await this.assignmentRepository.save(assignment);
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

        return serviceRequest;
    }
}
