import { Logger } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceRequest } from '@service-request/entities/service-request.entity';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { GetServiceRequestQuery } from '../get-service-request.query';

@QueryHandler(GetServiceRequestQuery)
export class GetServiceRequestHandler implements IQueryHandler<GetServiceRequestQuery> {
    private readonly logger = new Logger(GetServiceRequestHandler.name);

    constructor(@InjectRepository(ServiceRequest) private readonly repository: Repository<ServiceRequest>) { }

    async execute(query: GetServiceRequestQuery): Promise<IServiceRequest> {
        const { id } = query;
        const serviceRequest = await this.repository.findOne({ id });
        if (!serviceRequest) {
            this.logger.error(`service ticket not found: ${id}`);
            return null;
        }
        return serviceRequest;
    }
}
