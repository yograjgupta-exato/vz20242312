import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { DeepPartial, ManyToOne, Entity, Column, RelationId, JoinColumn } from 'typeorm';
import { AbstractEntity } from '@shared/entities/abstract.entity';
import { CurrencyCode, Tenant } from '@shared/enums';
import { WalletTransactionType } from '@shared/enums/wallet-transaction-type';
import { ColumnNumericTransformer } from '@shared/typeorm/column-numeric-transformer';
import { ServiceRequest } from '@service-request/entities/service-request.entity';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { IServiceProvider } from '@service-provider/interfaces/service-provider.interface';
import { ServiceProvider } from '@service-provider/service-provider.entity';
import { SourceTypeEnum } from '@wallet/enums/source-type.enum';
import { WalletTransactionStatusEnum } from '@wallet/enums/wallet-transaction-status.enum';
import { Payout } from '@payout/entities/payout.entity';
import { IPayout } from '@payout/interfaces/payout.interface';
import { IWallet } from './interfaces/wallet.interface';
import { Wallet } from './wallet.entity';

export class Source {
    @Column({ name: '_id', nullable: true })
    id?: string;
    @Column({ enum: SourceTypeEnum, name: '_type', nullable: true })
    type?: SourceTypeEnum;

    static fromServiceRequest(serviceRequest: IServiceRequest) {
        const source = new Source();
        source.id = serviceRequest.getId();
        source.type = SourceTypeEnum.SERVICE_REQUEST;
        return source;
    }

    static fromPayout(payoutId: string) {
        const source = new Source();
        source.id = payoutId;
        source.type = SourceTypeEnum.PAYOUT;
        return source;
    }
}

@Entity({ name: 'wallet_transactions' })
export class WalletTransaction extends AbstractEntity {
    constructor(input?: DeepPartial<WalletTransaction>) {
        super(input);
    }

    @Column('decimal', {
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    amount: number;

    @Column({
        default: CurrencyCode.Myr,
        enum: CurrencyCode,
        name: 'currency',
        type: 'enum',
    })
    currency: CurrencyCode;

    @ManyToOne(() => ServiceProvider, { cascade: true })
    owner: IServiceProvider;

    @ApiHideProperty()
    @Column({ nullable: true, type: 'uuid' })
    @RelationId((wt: WalletTransaction) => wt.owner)
    @Exclude()
    ownerId?: string;

    @Column({
        name: 'principal_group',
        type: 'enum',
        enum: Tenant,
        default: Tenant.Daikin,
    })
    principalGroup: Tenant;

    @Column({
        enum: WalletTransactionType,
        name: 'type',
        type: 'enum',
    })
    type: WalletTransactionType;

    @ManyToOne(
        () => Wallet,
        wallet => wallet.transactions,
        {
            cascade: true,
        },
    )
    wallet: IWallet;

    @Column({ type: 'enum', enum: WalletTransactionStatusEnum, default: WalletTransactionStatusEnum.SUCCESS })
    status: WalletTransactionStatusEnum;

    @Column(() => Source)
    source?: Source;

    @ManyToOne(
        () => Payout,
        payout => payout.walletTransactions,
    )
    payout: IPayout;

    @Column({ nullable: true, type: 'uuid' })
    @RelationId((item: WalletTransaction) => item.payout)
    payoutId?: string;

    @Column({ nullable: true, type: 'uuid' })
    @RelationId((join: WalletTransaction) => join.serviceRequest)
    serviceRequestId: string;

    @ManyToOne(
        () => ServiceRequest,
        sr => sr.walletTransactions,
    )
    serviceRequest: IServiceRequest;

    static forRescheduleSurchargeCompensation(wallet: IWallet, serviceRequest: IServiceRequest) {
        const wt = new WalletTransaction();
        wt.amount = serviceRequest.getCustomerRescheduleOrder().impactedServiceProviderCompensationAmount;
        wt.type = WalletTransactionType.RESCHEDULE_SURCHARGE_COMPENSATION;
        wt.wallet = wallet;
        wt.wallet.debit(serviceRequest.getCustomerRescheduleOrder().impactedServiceProviderCompensationAmount);
        wt.ownerId = wallet.getOwnerId();
        wt.principalGroup = serviceRequest.getPrincipalGroup();
        wt.source = Source.fromServiceRequest(serviceRequest);
        wt.serviceRequest = serviceRequest;
        return wt;
    }

    static forIncome(wallet: IWallet, serviceRequest: IServiceRequest) {
        const wt = new WalletTransaction();
        wt.amount = serviceRequest.getServiceProviderEarning();
        wt.type = WalletTransactionType.INCOME;
        wt.wallet = wallet;
        wt.wallet.debit(serviceRequest.getServiceProviderEarning());
        wt.ownerId = wallet.getOwnerId();
        wt.principalGroup = serviceRequest.getPrincipalGroup();
        wt.source = Source.fromServiceRequest(serviceRequest);
        wt.serviceRequest = serviceRequest;
        return wt;
    }

    // holdPayout
    static forPayout(wallet: IWallet, payout: IPayout) {
        const wt = new WalletTransaction();
        wt.amount = -payout.getAmount();
        wt.type = WalletTransactionType.PAYOUT;
        wt.wallet = wallet;
        wt.wallet.holdBalanceForPayout(payout.getAmount());
        wt.ownerId = wallet.getOwnerId();
        wt.principalGroup = payout.getPrincipalGroup();
        wt.source = Source.fromPayout(payout.getId());
        wt.payout = payout;
        wt.status = WalletTransactionStatusEnum.PENDING;
        return wt;
    }

    releasePayout(wallet: IWallet, payout: IPayout): boolean {
        if (this.type !== WalletTransactionType.PAYOUT) {
            return false;
        }

        wallet.releaseBalanceForPayout(payout.getAmount());
        this.wallet = wallet;
        this.status = WalletTransactionStatusEnum.SUCCESS;
        return true;
    }
}
