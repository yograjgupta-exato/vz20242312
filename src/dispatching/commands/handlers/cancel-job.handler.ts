import { ICommandHandler, CommandHandler, QueryBus, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceRequestCancelledEvent } from '@cqrs/events/service-request.event';
import { UserType } from '@shared/enums';
import { EntityNotFoundError } from '@shared/errors';
import { ServiceRequest } from '@service-request/entities/service-request.entity';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { GetServiceRequestQuery } from '@service-request/queries/get-service-request.query';
import { CancelJobCommand } from '../cancel-job.command';
import { IServiceProvider } from 'service-provider/interfaces/service-provider.interface';
import { GetServiceProviderQuery } from 'service-provider/queries/get-service-provider.query';

@CommandHandler(CancelJobCommand)
export class CancelJobHandler implements ICommandHandler<CancelJobCommand> {
    constructor(
        private readonly eventBus: EventBus,
        private readonly queryBus: QueryBus,
        // refactor(roy): if possible, do not import service-request-repo
        @InjectRepository(ServiceRequest) private readonly serviceRequestRepository: Repository<ServiceRequest>,
    ) {}

    // refactor(roy): 98% logics here are duplicated as
    // `commands/handlers/AcceptNewDispatchedJobHandler`
    // except it doesn't need to validate if this job has been dispatched to in the
    // first place.

    // refactor(roy): should we keep allocation history?
    async execute(command: CancelJobCommand): Promise<IServiceRequest> {
        const { providerId, serviceRequestId } = command;

        const serviceRequest: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(serviceRequestId));
        if (!serviceRequest) {
            throw new EntityNotFoundError('ServiceRequest', serviceRequestId);
        }

        const serviceProvider: IServiceProvider = await this.queryBus.execute(new GetServiceProviderQuery(providerId));
        if (!serviceProvider) {
            throw new EntityNotFoundError('ServiceProvider', providerId);
        }

        serviceRequest.cancel(serviceProvider);
        serviceRequest.beforeSave();
        await this.serviceRequestRepository.save(serviceRequest);
        if (serviceRequest.hasBeenCancelled()) {
            this.eventBus.publish(new ServiceRequestCancelledEvent(serviceRequest, providerId, null, UserType.PROVIDER));
        }
        return serviceRequest;
    }
}
