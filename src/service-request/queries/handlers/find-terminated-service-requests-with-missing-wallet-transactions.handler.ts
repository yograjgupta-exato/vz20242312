/* eslint-disable max-len */
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { getCustomRepository, Repository } from 'typeorm';
import { ServiceRequest } from '@service-request/entities/service-request.entity';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { ServiceRequestRepository } from '@service-request/repository/service-request.repository';
import { FindTerminatedServiceRequestsWithMissingWalletTransactionsQuery } from '../find-terminated-service-requests-with-missing-wallet-transactions.query';

@QueryHandler(FindTerminatedServiceRequestsWithMissingWalletTransactionsQuery)
export class FindTerminatedServiceRequestWithMissingWalletTransactionsHandler
    implements IQueryHandler<FindTerminatedServiceRequestsWithMissingWalletTransactionsQuery> {
    constructor(@InjectRepository(ServiceRequest) private readonly repository: Repository<ServiceRequest>) {}
    async execute(): Promise<IServiceRequest[]> {
        return getCustomRepository(ServiceRequestRepository).findTerminatedServiceRequestsWithMissingWalletTransactions();
    }
}
