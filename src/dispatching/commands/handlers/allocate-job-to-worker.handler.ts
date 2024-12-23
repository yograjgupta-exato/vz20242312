import { ICommandHandler, CommandHandler, QueryBus, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceRequestAllocatedEvent } from '@cqrs/events/service-request.event';
import { EntityNotFoundError } from '@shared/errors';
import { ServiceRequest } from '@service-request/entities/service-request.entity';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { GetServiceRequestQuery } from '@service-request/queries/get-service-request.query';
import { Appointment } from '../../entities/appointment.entity';
import { AllocateJobToWorkerCommand } from '../allocate-job-to-worker.command';
import { AppointmentFactory } from 'dispatching/entities/factories/appointment.factory';
import { IServiceProvider } from 'service-provider/interfaces/service-provider.interface';
import { GetServiceProviderQuery } from 'service-provider/queries/get-service-provider.query';

@CommandHandler(AllocateJobToWorkerCommand)
export class AllocateJobToWorkerHandler implements ICommandHandler<AllocateJobToWorkerCommand> {
    constructor(
        private readonly eventBus: EventBus,
        @InjectRepository(Appointment) private readonly allocationRepository: Repository<Appointment>,
        private readonly queryBus: QueryBus,
        // refactor(roy): if possible, do not import service-request-repo
        @InjectRepository(ServiceRequest) private readonly serviceRequestRepository: Repository<ServiceRequest>,
    ) {}

    // refactor(roy): 98% logics here are duplicated as
    // `commands/handlers/AcceptNewDispatchedJobHandler`
    // except it doesn't need to validate if this job has been dispatched to in the
    // first place.

    // refactor(roy): should we keep allocation history?
    async execute(command: AllocateJobToWorkerCommand): Promise<IServiceRequest> {
        const { dealerId, workerId, serviceRequestId } = command;

        if (!workerId || !serviceRequestId) {
            throw new Error(`Missing Data: providerId=${workerId} or serviceRequestId=${serviceRequestId}`);
        }

        const serviceRequest: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(serviceRequestId));
        if (!serviceRequest) {
            throw new EntityNotFoundError('ServiceRequest', serviceRequestId);
        }

        const dealer: IServiceProvider = await this.queryBus.execute(new GetServiceProviderQuery(dealerId));
        if (!dealer) {
            throw new EntityNotFoundError('ServiceProvider', dealerId);
        }

        const worker: IServiceProvider = await this.queryBus.execute(new GetServiceProviderQuery(workerId));
        if (!worker) {
            throw new EntityNotFoundError('ServiceProvider', workerId);
        }

        if (serviceRequest.isAllocatedTo(worker.getId())) {
            return serviceRequest;
        }

        serviceRequest.allocateToWorker(worker, dealer);
        serviceRequest.beforeSave();
        await this.serviceRequestRepository.save(serviceRequest);

        await this.allocationRepository.save(AppointmentFactory.create(serviceRequest));

        this.eventBus.publish(new ServiceRequestAllocatedEvent(serviceRequest));

        return serviceRequest;
    }
}
