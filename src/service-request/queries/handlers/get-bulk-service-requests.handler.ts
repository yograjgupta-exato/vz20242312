import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceRequest } from '../../entities/service-request.entity';
import { IServiceRequest } from '../../interfaces/service-request.interface';
import { GetBulkServiceRequestsQuery } from '../get-bulk-service-requests.query';

@QueryHandler(GetBulkServiceRequestsQuery)
export class GetBulkServiceRequestsHandler implements IQueryHandler<GetBulkServiceRequestsQuery> {
    constructor(@InjectRepository(ServiceRequest) private readonly repository: Repository<ServiceRequest>) {}
    async execute(query: GetBulkServiceRequestsQuery): Promise<IServiceRequest[]> {
        const { ids } = query;
        return this.repository.findByIds(ids);
    }
}
