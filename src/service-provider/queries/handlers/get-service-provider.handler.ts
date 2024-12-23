import { Logger } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IServiceProvider } from '../../interfaces/service-provider.interface';
import { ServiceProvider } from '../../service-provider.entity';
import { GetServiceProviderQuery } from '../get-service-provider.query';

@QueryHandler(GetServiceProviderQuery)
export class GetServiceProviderHandler implements IQueryHandler<GetServiceProviderQuery> {
    private readonly logger = new Logger(GetServiceProviderHandler.name);

    constructor(@InjectRepository(ServiceProvider) private readonly repository: Repository<ServiceProvider>) { }

    async execute(query: GetServiceProviderQuery): Promise<IServiceProvider> {
        const { id } = query;
        const serviceProvider = await this.repository.findOne({ id });
        if (!serviceProvider) {
            this.logger.error(`service provider not found: ${id}`);
            return null;
        }
        return serviceProvider;
    }
}
