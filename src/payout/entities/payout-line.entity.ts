import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { IServiceProvider } from '../../service-provider/interfaces/service-provider.interface';
import { Bank, ServiceProvider } from '../../service-provider/service-provider.entity';
import { ServiceRequest } from '../../service-request/entities/service-request.entity';
import { IServiceRequest } from '../../service-request/interfaces/service-request.interface';
import { AbstractEntity } from '../../shared/entities/abstract.entity';
import { CurrencyCode, Tenant } from '../../shared/enums';
import { ColumnNumericTransformer } from '../../shared/typeorm/column-numeric-transformer';
import { WalletTransaction } from '../../wallet/entities/wallet-transaction.entity';
import { PayoutLineTypeEnum } from '../enums/payout-line-type.enum';
import { PayoutStatusEnum } from '../enums/payout-status.enum';
import { IPayout } from '../interfaces/payout.interface';
import { PayoutBatch } from './payout-batch.entity';
import { Payout } from './payout.entity';

@Entity({ name: 'payout_lines' })
export class PayoutLine extends AbstractEntity {
    @Column('decimal', {
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    amount: number;

    @Column({
        default: CurrencyCode.Myr,
        enum: CurrencyCode,
        type: 'enum',
    })
    currency: CurrencyCode;

    @Column({ nullable: true, type: 'uuid' })
    @RelationId((line: PayoutLine) => line.walletTransaction)
    walletTransactionId: string;

    @ManyToOne(() => WalletTransaction)
    walletTransaction: WalletTransaction;

    @Column({ nullable: true, type: 'uuid' })
    @RelationId((line: PayoutLine) => line.serviceRequest)
    serviceRequestId: string;

    @ManyToOne(() => ServiceRequest)
    serviceRequest: IServiceRequest;

    @Column({ type: 'uuid' })
    @RelationId((line: PayoutLine) => line.payout)
    payoutId: string;

    @ManyToOne(() => Payout, { eager: true })
    payout: IPayout;

    // note(roy): why do we need payoutBatchId/payoutBatch since we already linked to payout?
    //
    // Because payment-response(service-request-id, service-provider-vendor-id) has to update here first prior to payout.
    // Note, the payment-response doesn't contain batchNo information.
    // Hence, this can serves as a backtracking to payout-batch later on (if needed)
    @Column({ nullable: true, type: 'uuid' })
    @RelationId((line: PayoutLine) => line.payoutBatch)
    payoutBatchId?: string;

    @ManyToOne(() => PayoutBatch)
    payoutBatch: PayoutBatch;

    @ManyToOne(() => ServiceProvider)
    owner: IServiceProvider;

    @Column({ type: 'uuid' })
    @RelationId((line: PayoutLine) => line.owner)
    ownerId: string;

    @Column({ nullable: true })
    ownerVendorId?: string;

    @Column({
        name: 'principal_group',
        type: 'enum',
        enum: Tenant,
        default: Tenant.Daikin,
    })
    principalGroup: Tenant;

    @Column()
    customerName: string;

    @Column(() => Bank)
    bank: Bank;

    @Column()
    itemRefId: string;

    @Column()
    itemDescription: string;

    @Column('decimal', {
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    itemSalesAmount: number;

    @Column({
        default: PayoutLineTypeEnum.SERVICE_PACKAGE,
        enum: PayoutLineTypeEnum,
        type: 'enum',
    })
    itemType: PayoutLineTypeEnum;

    @Column({
        default: PayoutStatusEnum.SCHEDULED,
        enum: PayoutStatusEnum,
        type: 'enum',
    })
    status: PayoutStatusEnum;

    @Column({ nullable: true })
    sapDocumentPaymentNo?: string;

    @Column({
        name: 'paid_at',
        nullable: true,
    })
    paymentDate?: string;

    @Column({
        nullable: true,
    })
    consumerPromotionCode?: string;

    @Column('decimal', {
        default: 0,
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    consumerPromotionAmount: number;

    @Column('decimal', {
        default: 0,
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    consumerQuotationUnitPrice: number;

    @Column('decimal', {
        default: 0,
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    serviceProviderQuotationUnitPrice: number;

    public payoutBatchInTransit(payoutBatchId: string): void {
        if (this.status !== PayoutStatusEnum.SCHEDULED) {
            throw new Error(`Payout line not in correct state to be marked as in-transit, id: ${this.id}`);
        }
        this.payoutBatchId = payoutBatchId;
        this.status = PayoutStatusEnum.IN_TRANSIT;
    }

    public markAsPaid(sapDocumentPaymentNo: string, paymentDate: string) {
        if (this.status !== PayoutStatusEnum.IN_TRANSIT) {
            throw new Error(`Payout line not in correct state to be marked as paid, id: ${this.id}`);
        }
        this.sapDocumentPaymentNo = sapDocumentPaymentNo;
        this.paymentDate = paymentDate;
        this.status = PayoutStatusEnum.PAID;
    }
}
