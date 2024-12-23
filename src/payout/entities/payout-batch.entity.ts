import * as moment from 'moment';
import { Column, Entity, OneToMany, Unique } from 'typeorm';
import { AbstractEntity } from '@shared/entities/abstract.entity';
import { CurrencyCode, Tenant } from '@shared/enums';
import { ColumnNumericTransformer } from '@shared/typeorm/column-numeric-transformer';
import { PayoutBatchStatusEnum } from '@payout/enums/payout-batch-status.enum';
import { IPayout } from '../interfaces/payout.interface';
import { Payout } from './payout.entity';

@Entity({ name: 'payout_batches' })
@Unique(['principalGroup', 'date', 'dailyRunningCount'])
export class PayoutBatch extends AbstractEntity {
    @Column({
        default: CurrencyCode.Myr,
        enum: CurrencyCode,
        type: 'enum',
    })
    currency: CurrencyCode;

    @Column('decimal', {
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    totalAmount: number;

    @Column({ default: 1 })
    totalRecords: number;

    @Column({ nullable: true })
    scbPaymentFileUrl?: string;

    @Column({ nullable: true })
    payoutSummaryFileUrl?: string;

    @Column({ nullable: true })
    payoutLinesFileUrl?: string;

    @Column({
        name: 'principal_group',
        type: 'enum',
        enum: Tenant,
        default: Tenant.Daikin,
    })
    principalGroup: Tenant;

    @OneToMany(
        () => Payout,
        payout => payout.payoutBatch,
        { cascade: true, eager: true },
    )
    payouts: IPayout[];

    @Column({
        type: 'simple-json',
        nullable: true,
    })
    payoutIds?: string[];

    @Column({
        default: PayoutBatchStatusEnum.SCHEDULED,
        enum: PayoutBatchStatusEnum,
        type: 'enum',
    })
    status: PayoutBatchStatusEnum;

    @Column({ default: 1 })
    dailyRunningCount: number;

    @Column()
    date: string;

    @Column({ nullable: true })
    err?: string;

    constructor(payouts: IPayout[], dailyRunningCount: number, now: Date) {
        super();
        if (payouts === undefined || dailyRunningCount === undefined || now === undefined) {
            return;
        }

        this.date = moment(now).format('YYYY/MM/DD');
        this.principalGroup = payouts[0].getPrincipalGroup();
        this.dailyRunningCount = dailyRunningCount;
        this.payouts = payouts;
        this.payoutIds = payouts.map(payout => payout.getId());
        this.totalRecords = payouts.length;
        this.totalAmount = payouts.reduce((sum, payout) => sum + payout.getAmount(), 0);
        this.status = PayoutBatchStatusEnum.SCHEDULED;
    }

    public setUploadedPaymentFiles(scbPaymentFileUrl: string, payoutSummaryFileUrl: string, payoutLinesFileUrl: string) {
        if (this.status !== PayoutBatchStatusEnum.SCHEDULED) {
            throw new Error(`Payout batch not in correct state to accept new payment file: ${this}`);
        }

        this.scbPaymentFileUrl = scbPaymentFileUrl;
        this.payoutSummaryFileUrl = payoutSummaryFileUrl;
        this.payoutLinesFileUrl = payoutLinesFileUrl;
        this.status = PayoutBatchStatusEnum.IN_TRANSIT;
        this.payouts.forEach(payout => payout.paymentFileUploaded());
    }

    public paymentFileUploadFailed(err: string) {
        this.status = PayoutBatchStatusEnum.FAILED;
        this.err = err;
    }

    public markAsPaid() {
        this.status = PayoutBatchStatusEnum.PAID;
        this.payouts.forEach(payout => payout.markAsPaid());
    }
}
