/* eslint-disable max-len */
import { ICommandHandler, CommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { FindTerminatedServiceRequestsWithMissingWalletTransactionsQuery } from '@service-request/queries/find-terminated-service-requests-with-missing-wallet-transactions.query';
import { IWallet } from '@wallet/entities/interfaces/wallet.interface';
import { WalletTransaction } from '@wallet/entities/wallet-transaction.entity';
import { Wallet } from '@wallet/entities/wallet.entity';
import { PaymentPurposeCode } from '../../../shared/enums/payment-purpose-code';
import { RegenMissingWalletTransactionsFromFulfilledServiceRequestsCommand } from '../regen-missing-wallet-transactions-from-fulfilled-service-requests.command';

@CommandHandler(RegenMissingWalletTransactionsFromFulfilledServiceRequestsCommand)
export class RegenMissingWalletTransactionsFromFulfilledServiceRequestsHandler
    implements ICommandHandler<RegenMissingWalletTransactionsFromFulfilledServiceRequestsCommand> {
    constructor(
        private readonly queryBus: QueryBus,
        @InjectRepository(Wallet) private readonly walletRepository: Repository<Wallet>,
        @InjectRepository(WalletTransaction) private readonly walletTransactionRepository: Repository<WalletTransaction>,
    ) {}

    async execute(): Promise<void> {
        const serviceRequests: IServiceRequest[] = await this.queryBus.execute(new FindTerminatedServiceRequestsWithMissingWalletTransactionsQuery());
        for (const sr of serviceRequests) {
            let wallet: IWallet;
            const walletTransactions: WalletTransaction[] = [];

            if (sr.hasBeenFulfilled() && sr.hasBeenAssignedOrAllocated()) {
                wallet =
                    (await this.walletRepository.findOne({ ownerId: sr.getServiceProvider().dispatcher.id })) ||
                    Wallet.fromOwner(sr.getServiceProvider().dispatcher.id);
                walletTransactions.push(WalletTransaction.forIncome(wallet, sr));
            }

            if (walletTransactions.length < 1) {
                continue;
            }

            await this.walletTransactionRepository.save(walletTransactions);
        }

        for (const sr of serviceRequests) {
            let wallet: IWallet;
            const walletTransactions: WalletTransaction[] = [];

            if ((sr.hasBeenMarkAsFailed() || sr.hasBeenFulfilled()) && sr.hasCustomerPaid(PaymentPurposeCode.EC_RESCHEDULE_SURCHARGE)) {
                wallet =
                    (await this.walletRepository.findOne({ ownerId: sr.getCustomerRescheduleOrder().impactedServiceProviderId })) ||
                    Wallet.fromOwner(sr.getCustomerRescheduleOrder().impactedServiceProviderId);
                walletTransactions.push(WalletTransaction.forRescheduleSurchargeCompensation(wallet, sr));
            }

            if (walletTransactions.length < 1) {
                continue;
            }

            await this.walletTransactionRepository.save(walletTransactions);
        }
    }
}
