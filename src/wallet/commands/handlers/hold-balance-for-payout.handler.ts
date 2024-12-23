import { Logger } from '@nestjs/common';
import { ICommandHandler, CommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityNotFoundError } from '@shared/errors';
import { IWallet } from '@wallet/entities/interfaces/wallet.interface';
import { WalletTransaction } from '@wallet/entities/wallet-transaction.entity';
import { Wallet } from '@wallet/entities/wallet.entity';
import { IPayout } from '@payout/interfaces/payout.interface';
import { GetPayoutQuery } from '@payout/queries/get-payout.query';
import { WalletTransactionType } from '../../../shared/enums/wallet-transaction-type';
import { HoldBalanceForPayoutCommand } from '../hold-balance-for-payout.command';

@CommandHandler(HoldBalanceForPayoutCommand)
export class HoldBalanceForPayoutHandler implements ICommandHandler<HoldBalanceForPayoutCommand> {
    constructor(
        private readonly queryBus: QueryBus,
        @InjectRepository(Wallet) private readonly walletRepository: Repository<Wallet>,
        @InjectRepository(WalletTransaction) private readonly walletTransactionRepository: Repository<WalletTransaction>,
    ) {}
    private readonly logger = new Logger(HoldBalanceForPayoutHandler.name);

    async execute(command: HoldBalanceForPayoutCommand): Promise<void> {
        const { payoutId } = command;
        const payout: IPayout = await this.queryBus.execute(new GetPayoutQuery(payoutId));
        if (!payout) {
            throw new EntityNotFoundError('Payout', payoutId);
        }

        const walletPayouts = await this.walletTransactionRepository.find({
            type: WalletTransactionType.PAYOUT,
            payoutId,
        });
        if (walletPayouts.length > 0) {
            this.logger.warn(`warning existing payout transaction: wallet from owner: ${payout.getOwner().getId()}`);
            return;
        }

        const wallet: IWallet = await this.walletRepository.findOne({ ownerId: payout.getOwner().getId() });
        if (!wallet) {
            this.logger.error(`Error creating payout transaction: wallet from owner: ${payout.getOwner().getId()} not found`);
            return;
        }

        const walletTransaction = WalletTransaction.forPayout(wallet, payout);
        await this.walletTransactionRepository.save(walletTransaction);
    }
}
