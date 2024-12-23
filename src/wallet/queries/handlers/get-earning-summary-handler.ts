import { IQueryHandler, QueryHandler, QueryBus } from '@nestjs/cqrs';
import { getCustomRepository } from 'typeorm';
import { EntityNotFoundError } from '@shared/errors';
import { IServiceProvider } from '@service-provider/interfaces/service-provider.interface';
import { GetServiceProviderQuery } from '@service-provider/queries/get-service-provider.query';
import { GetEarningSummaryQuery } from '../get-earning-summary.query';
import { EarningSummaryDto } from 'wallet/dtos/earning-summary.dto';
import { WalletTransactionRepository } from 'wallet/repository/wallet-transaction.repository';

@QueryHandler(GetEarningSummaryQuery)
export class GetEarningSummaryHandler implements IQueryHandler<GetEarningSummaryQuery> {
    constructor(private readonly queryBus: QueryBus) {}

    async execute(query: GetEarningSummaryQuery): Promise<EarningSummaryDto> {
        const { providerId, input } = query;

        const owner: IServiceProvider = await this.queryBus.execute(new GetServiceProviderQuery(providerId));
        if (!owner) {
            throw new EntityNotFoundError('ServiceProvider', providerId);
        }

        const walletTransactionRepository = getCustomRepository(WalletTransactionRepository);
        return walletTransactionRepository.findEarningSummary(owner.getId(), input.fromDate, input.toDate, input.groupBy);
    }
}
