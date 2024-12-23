import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { getCustomRepository, Repository } from 'typeorm';
import { EntityNotFoundError } from '@shared/errors';
import { IWallet } from '@wallet/entities/interfaces/wallet.interface';
import { WalletTransaction } from '@wallet/entities/wallet-transaction.entity';
import { Wallet } from '@wallet/entities/wallet.entity';
import { WalletTransactionRepository } from '@wallet/repository/wallet-transaction.repository';
import { IPayout } from '@payout/interfaces/payout.interface';
import { GetPayoutQuery } from '@payout/queries/get-payout.query';
import { ReleaseBalanceForPayoutCommand } from '../release-balance-for-payout.command';

@CommandHandler(ReleaseBalanceForPayoutCommand)
export class ReleaseBalanceForPayoutHandler implements ICommandHandler<ReleaseBalanceForPayoutCommand> {
    constructor(
        private readonly queryBus: QueryBus,
        @InjectRepository(Wallet) private readonly walletRepository: Repository<Wallet>,
        @InjectRepository(WalletTransaction) private readonly walletTransactionRepository: Repository<WalletTransaction>,
    ) {}
    private readonly logger = new Logger(ReleaseBalanceForPayoutHandler.name);

    async execute(command: ReleaseBalanceForPayoutCommand): Promise<void> {
        const { payoutId } = command;
        const payout: IPayout = await this.queryBus.execute(new GetPayoutQuery(payoutId));
        if (!payout) {
            throw new EntityNotFoundError('Payout', payoutId);
        }

        const wallet: IWallet = await this.walletRepository.findOne({ ownerId: payout.getOwner().getId() });
        if (!wallet) {
            this.logger.error(`Error releasing balance for payout: Wallet not found for payout '${payout.getId()}'`);
            return;
        }

        const walletTransaction = await getCustomRepository(WalletTransactionRepository).getPendingPayoutTransactionByPayoutId(payout.getId());
        if (!walletTransaction) {
            this.logger.error(`Error releasing balance for payout: Wallet Transaction not found for payout '${payout.getId()}'`);
            return;
        }

        const released = walletTransaction.releasePayout(wallet, payout);
        if (!released) {
            this.logger.error(`Error releasing balance for payout: Unable to release payout for payout '${payout.getId()}'`);
            return;
        }
        await this.walletTransactionRepository.save(walletTransaction);
    }
}
