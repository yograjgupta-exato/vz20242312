import { ICommandHandler, CommandHandler, QueryBus, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceRequestRevokedEvent } from '@cqrs/events/service-request.event';
import { EntityNotFoundError } from '@shared/errors';
import { ServiceRequest } from '@service-request/entities/service-request.entity';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { GetServiceRequestQuery } from '@service-request/queries/get-service-request.query';
import { RevokeJobCommand } from '../revoke-job.command';

@CommandHandler(RevokeJobCommand)
export class RevokeJobHandler implements ICommandHandler<RevokeJobCommand> {
    constructor(
        private readonly eventBus: EventBus,
        private readonly queryBus: QueryBus,
        @InjectRepository(ServiceRequest) private readonly serviceRequestRepository: Repository<ServiceRequest>,
    ) {}

    // refactor(roy): 98% logics here are duplicated as
    // `commands/handlers/AcceptNewDispatchedJobHandler`
    // except it doesn't need to validate if this job has been dispatched to in the
    // first place.

    // refactor(roy): should we keep allocation history?
    async execute(command: RevokeJobCommand): Promise<IServiceRequest> {
        const { serviceRequestId } = command;

        const serviceRequest: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(serviceRequestId));
        if (!serviceRequest) {
            throw new EntityNotFoundError('ServiceRequest', serviceRequestId);
        }

        const providerId = serviceRequest.getServiceProvider().dispatcher.id;

        serviceRequest.revoke(command.markAsFailed);
        serviceRequest.beforeSave();
        await this.serviceRequestRepository.save(serviceRequest);

        if (serviceRequest.hasBeenCancelled()) {
            this.eventBus.publish(new ServiceRequestRevokedEvent(serviceRequest, providerId));
        }
        return serviceRequest;
    }
}
