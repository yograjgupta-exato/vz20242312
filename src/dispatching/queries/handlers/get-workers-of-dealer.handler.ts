import { QueryHandler, IQueryHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getCustomRepository } from 'typeorm';
import { ServiceProviderType } from '@shared/enums/service-provider-type';
import { EntityNotFoundError } from '@shared/errors';
import { ServiceRequest } from '@service-request/entities/service-request.entity';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { GetServiceRequestQuery } from '@service-request/queries/get-service-request.query';
import { GetWorkersOfDealerQuery } from '../get-workers-of-dealer.query';
import { Appointment } from 'dispatching/entities/appointment.entity';
import { AppointmentRepository } from 'dispatching/repository/appointment.repository';
import { ServiceProvider } from 'service-provider/service-provider.entity';

@QueryHandler(GetWorkersOfDealerQuery)
export class GetWorkersOfDealerHandler implements IQueryHandler<GetWorkersOfDealerQuery> {
    constructor(
        @InjectRepository(Appointment) private readonly allocationRepository: Repository<Appointment>,

        private readonly queryBus: QueryBus,
        @InjectRepository(ServiceRequest) private readonly serviceTicketRepository: Repository<ServiceRequest>,
        @InjectRepository(ServiceProvider) private readonly serviceProviderRepository: Repository<ServiceProvider>,
    ) {}

    async execute(query: GetWorkersOfDealerQuery): Promise<ServiceProvider[]> {
        const { dealerId, serviceRequestId } = query;

        const serviceRequest: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(serviceRequestId));
        if (!serviceRequest) {
            throw new EntityNotFoundError('ServiceRequest', serviceRequestId);
        }
        const workers = await this.serviceProviderRepository.find({
            where: {
                type: ServiceProviderType.WORKER,
                dealerId,
            },
        });

        const appointmentRepo = getCustomRepository(AppointmentRepository);
        const overlappedAppointmentsOfWorkers = await appointmentRepo.findOverlappingAllocatedAppointmentsOfWorkers(
            workers,
            serviceRequest.serviceSchedule(),
        );
        const busyWorkerIDs = overlappedAppointmentsOfWorkers.map(a => a.provider.worker.id);

        return workers.filter(w => {
            return !busyWorkerIDs.includes(w.getId());
        });
    }
}
