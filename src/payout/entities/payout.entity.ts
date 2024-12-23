import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { AbstractEntity } from '@shared/entities/abstract.entity';
import { CurrencyCode, Tenant } from '@shared/enums';
import { ColumnNumericTransformer } from '@shared/typeorm/column-numeric-transformer';
import { IServiceProvider } from '@service-provider/interfaces/service-provider.interface';
import { Bank, ServiceProvider } from '@service-provider/service-provider.entity';
import { WalletTransaction } from '@wallet/entities/wallet-transaction.entity';
import { PayoutStatusEnum } from '@payout/enums/payout-status.enum';
import { IPayout } from '../interfaces/payout.interface';
import { PayoutBatch } from './payout-batch.entity';

@Entity({ name: 'payouts' })
export class Payout extends AbstractEntity implements IPayout {
    @Column('decimal', {
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    amount: number;

    // warn(roy): this is a snapshot of real bank account, could be
    // obsoleted.
    @Column(() => Bank)
    bank: Bank;

    @Column({
        default: CurrencyCode.Myr,
        enum: CurrencyCode,
        type: 'enum',
    })
    currency: CurrencyCode;

    @ManyToOne(() => ServiceProvider, { cascade: true, eager: true })
    owner: IServiceProvider;

    @ApiHideProperty()
    @Column({ nullable: true, type: 'uuid' })
    @RelationId((payout: Payout) => payout.owner)
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
        default: PayoutStatusEnum.SCHEDULED,
        enum: PayoutStatusEnum,
        type: 'enum',
    })
    status: PayoutStatusEnum;

    @OneToMany(
        () => WalletTransaction,
        walletTransaction => walletTransaction.payout,
        { cascade: true },
    )
    walletTransactions: WalletTransaction[];

    @RelationId((item: Payout) => item.payoutBatch)
    payoutBatchId: string;

    @ManyToOne(
        () => PayoutBatch,
        payoutBatch => payoutBatch.payouts,
    )
    payoutBatch: PayoutBatch;

    @Column('decimal', {
        default: 0,
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    processedAmount: number;

    public getId(): string {
        return this.id;
    }

    public getOwner(): IServiceProvider {
        return this.owner;
    }

    public getPrincipalGroup(): Tenant {
        return this.principalGroup;
    }

    public getAmount(): number {
        return this.amount;
    }

    public paymentFileUploaded(): void {
        this.status = PayoutStatusEnum.IN_TRANSIT;
    }

    public markAsPaid(): void {
        this.status = PayoutStatusEnum.PAID;
    }

    public hasPaid(): boolean {
        return this.status === PayoutStatusEnum.PAID;
    }

    public hasPaymentFullyProcessed(): boolean {
        return this.processedAmount === this.amount;
    }
}
