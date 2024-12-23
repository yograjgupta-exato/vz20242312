import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { getCustomRepository } from 'typeorm';
import { WalletTransactionRepository } from '@wallet/repository/wallet-transaction.repository';
import { GetDebitableTransactionsForPayoutQuery } from '../get-debitable-transactions-for-payout.query';

@QueryHandler(GetDebitableTransactionsForPayoutQuery)
export class GetDebitableTransactionsForPayoutHandler implements IQueryHandler<GetDebitableTransactionsForPayoutQuery> {
    async execute() {
        const walletTransactionRepository = getCustomRepository(WalletTransactionRepository);
        return walletTransactionRepository.findDebitableTransactionsForPayout();
    }
}
