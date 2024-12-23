import { Logger } from '@nestjs/common';
import { QueryHandler, IQueryHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getCustomRepository } from 'typeorm';
import { EntityNotFoundError } from '@shared/errors';
import { ServiceRequest } from '@service-request/entities/service-request.entity';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { GetActiveServiceRequestsOfProviderQuery } from '@service-request/queries/get-active-service-requests-of-provider.query';
import { ServiceRequestRepository } from '@service-request/repository/service-request.repository';
import { IServiceProvider } from '@service-provider/interfaces/service-provider.interface';
import { GetServiceProviderQuery } from '@service-provider/queries/get-service-provider.query';

@QueryHandler(GetActiveServiceRequestsOfProviderQuery)
export class GetActiveServiceRequestsOfProviderHandler implements IQueryHandler<GetActiveServiceRequestsOfProviderQuery> {
    private readonly logger = new Logger(GetActiveServiceRequestsOfProviderHandler.name);

    constructor(@InjectRepository(ServiceRequest) private readonly repository: Repository<ServiceRequest>, private readonly queryBus: QueryBus) {}

    async execute(query: GetActiveServiceRequestsOfProviderQuery): Promise<IServiceRequest[]> {
        const { providerId } = query;
        const serviceProvider: IServiceProvider = await this.queryBus.execute(new GetServiceProviderQuery(providerId));
        if (!serviceProvider) {
            throw new EntityNotFoundError('ServiceProvider', providerId);
        }

        const serviceRequestRepo = getCustomRepository(ServiceRequestRepository);
        const serviceRequests = await serviceRequestRepo.findOngoingServiceRequestsOfProvider(serviceProvider);
        if (serviceRequests.length < 0) {
            this.logger.error(`service request not found: ${providerId}`);
            return [];
        }
        return serviceRequests;
    }
}
