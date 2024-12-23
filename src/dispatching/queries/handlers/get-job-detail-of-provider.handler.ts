import { IQueryHandler, QueryHandler, QueryBus } from '@nestjs/cqrs';
import { EntityNotFoundError } from '@shared/errors';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { GetServiceRequestQuery } from '@service-request/queries/get-service-request.query';
import { GetJobDetailOfProviderQuery } from '../get-job-detail-of-provider.query';

@QueryHandler(GetJobDetailOfProviderQuery)
export class GetJobDetailOfProviderHandler implements IQueryHandler<GetJobDetailOfProviderQuery> {
    constructor(private readonly queryBus: QueryBus) { }

    async execute(query: GetJobDetailOfProviderQuery): Promise<IServiceRequest> {
        const { serviceRequestId, providerId } = query;

        if (!providerId || !serviceRequestId) {
            throw new Error('Missing data');
        }

        const serviceRequest: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(serviceRequestId));
        if (!serviceRequest) {
            throw new EntityNotFoundError('ServiceRequest', serviceRequestId);
        }

        if (serviceRequest.hasBeenAssignedOrAllocated() && !serviceRequest.isAssignedOrAllocatedTo(providerId)) {
            throw new Error("Invalid job request: job doesn't belong to you");
        }

        return serviceRequest;
    }
}
