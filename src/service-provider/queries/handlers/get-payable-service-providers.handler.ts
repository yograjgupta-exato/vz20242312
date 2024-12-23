import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { IServiceProvider } from '../../interfaces/service-provider.interface';
import { ServiceProvider } from '../../service-provider.entity';
import { GetPayableServiceProvidersQuery } from '../get-payable-service-providers.query';

@QueryHandler(GetPayableServiceProvidersQuery)
export class GetServiceProvidersByIdsHandler implements IQueryHandler<GetPayableServiceProvidersQuery> {
    constructor(@InjectRepository(ServiceProvider) private readonly repository: Repository<ServiceProvider>) {}
    async execute(query: GetPayableServiceProvidersQuery): Promise<IServiceProvider[]> {
        const { ids } = query;
        return this.repository.findByIds(ids, {
            where: {
                bank: {
                    accountHolderName: Raw(alias => `(${alias} IS NOT NULL AND ${alias} != '')`),
                    accountNumber: Raw(alias => `(${alias} IS NOT NULL AND ${alias} != '')`),
                    bankName: Raw(alias => `(${alias} IS NOT NULL AND ${alias} != '')`),
                    swiftCode: Raw(alias => `(${alias} IS NOT NULL AND ${alias} != '')`),
                },
            },
        });
    }
}
