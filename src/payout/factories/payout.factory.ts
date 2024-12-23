import { Injectable, Logger } from '@nestjs/common';
import { CurrencyCode } from 'aws-sdk/clients/devicefarm';
import { Tenant } from '@shared/enums';
import { IServiceProvider } from '@service-provider/interfaces/service-provider.interface';
import { WalletTransaction } from '@wallet/entities/wallet-transaction.entity';
import { Payout } from '../entities/payout.entity';

class WalletTransactionGroup {
    private transactions: WalletTransaction[];

    public constructor(transactions: WalletTransaction[]) {
        this.transactions = transactions;
    }

    public addTransaction(transaction: WalletTransaction) {
        this.transactions.push(transaction);
    }

    public getTotalAmount(): number {
        return this.transactions.reduce((total, trx) => total + trx.amount, 0);
    }

    public getCurrency(): CurrencyCode {
        return this.transactions[0]?.currency;
    }

    public getOwnerId(): string {
        return this.transactions[0]?.ownerId;
    }

    public getTransactions(): WalletTransaction[] {
        return this.transactions;
    }

    public getPrincipalGroup(): Tenant {
        return this.transactions[0]?.principalGroup;
    }
}

@Injectable()
export class PayoutFactory {
    private readonly logger = new Logger(PayoutFactory.name);

    public create(transactions: WalletTransaction[], serviceProviders: IServiceProvider[]): Payout[] {
        const serviceProviderLookup = this.generateServiceProviderLookup(serviceProviders);
        const walletTransactionGroupLookup = this.generateWalletTransactionGroupLookup(transactions);

        const groupIds = Object.keys(walletTransactionGroupLookup);
        const payouts: Payout[] = [];
        for (const groupId of groupIds) {
            const payout = new Payout();
            const group = walletTransactionGroupLookup[groupId];
            const owner = serviceProviderLookup[group.getOwnerId()];

            // note(roy): if owner is not found in the lookup, check GetPayableServiceProvidersQueryHandler
            // He might be missing one of the mandatory bank infos.
            if (!owner) {
                this.logger.error(`Error scheduling payout for owner: ${group.getOwnerId()}. 
                Please check for missing banking info: account-holder-name, account-number, bank-name, swift-code.`);
                continue;
            }

            payout.amount = group.getTotalAmount();
            payout.bank = owner.getBankInfo();
            payout.owner = owner;
            payout.principalGroup = group.getPrincipalGroup();
            payout.walletTransactions = group.getTransactions();
            payouts.push(payout);
        }

        return payouts;
    }

    private generateServiceProviderLookup(serviceProviders: IServiceProvider[]): { [id: string]: IServiceProvider } {
        return serviceProviders.reduce((lookup, sp) => {
            lookup[sp.getId()] = sp;
            return lookup;
        }, {});
    }

    private generateWalletTransactionGroupLookup(transactions: WalletTransaction[]): { [id: string]: WalletTransactionGroup } {
        const groupLookup: { [id: string]: WalletTransactionGroup } = {};

        transactions.forEach(trx => {
            const groupId = `${trx.ownerId}|${trx.principalGroup}`;
            groupLookup[groupId] = groupLookup[groupId] || new WalletTransactionGroup([]);
            groupLookup[groupId].addTransaction(trx);
        });

        return groupLookup;
    }
}
