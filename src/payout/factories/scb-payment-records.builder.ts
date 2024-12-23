import { validateSync } from 'class-validator';
import * as moment from 'moment';
import { ScbPaymentDetailDto, ScbPaymentHeaderDto, ScbPaymentInvoiceDto, ScbPaymentTrailerDto } from '../dtos/scb-payment.dto';
import { IPayout } from '../interfaces/payout.interface';

export class ScbPaymentRecordsBuilder {
    header: ScbPaymentHeaderDto;
    details: ScbPaymentDetailDto[];
    invoice: ScbPaymentInvoiceDto;
    trailer: ScbPaymentTrailerDto;

    id: string;
    now: Date;
    payouts: IPayout[];
    payerAccountNumber: string;
    payerCityCode: string;

    // refactor(roy): to builder's pattern
    public constructor(batchId: string, now: Date, payerAccountNumber: string, payerCityCode: string, payouts: IPayout[]) {
        this.reset();

        this.id = batchId;
        this.payerAccountNumber = payerAccountNumber;
        this.payerCityCode = payerCityCode;
        this.payouts = payouts;
        this.now = now;
    }

    private reset(): void {
        this.header = new ScbPaymentHeaderDto();
        this.details = [];
        this.invoice = new ScbPaymentInvoiceDto(null, null, null, 0);
        this.trailer = new ScbPaymentTrailerDto(null, 0);
    }

    private setHeader() {
        this.header = new ScbPaymentHeaderDto();
    }

    private setDetails() {
        this.details = this.payouts.map(
            payout =>
                new ScbPaymentDetailDto(
                    payout.getId(),
                    this.payerAccountNumber,
                    this.payerCityCode,
                    this.now,
                    payout.getOwner().getName(),
                    payout
                        .getOwner()
                        .getAddressString(' ')
                        .replace(',', ' '),
                    payout.getOwner().getBankInfo().swiftCode,
                    payout.getOwner().getBankInfo().accountNumber,
                    payout.getAmount(),
                    payout.getOwner().getEmailAddress(),
                ),
        );
    }

    private setInvoice() {
        this.invoice = new ScbPaymentInvoiceDto(this.id, this.now, 'batch payment file from uberisation', this.getPaymentAmount());
    }

    private setTrailer() {
        this.trailer = new ScbPaymentTrailerDto(this.payouts.length, this.getPaymentAmount());
    }

    private getPaymentAmount(): number {
        return this.payouts.reduce((sum, payout) => sum + payout.getAmount(), 0);
    }

    private validate(): void {
        const checks = [
            () => validateSync(this.header),
            () => this.details.map(d => validateSync(d)),
            () => validateSync(this.invoice),
            () => validateSync(this.trailer),
        ];

        checks.forEach(c => {
            const err = c();
            if (err.length > 0 && [].concat(err[0]).filter(elem => !!elem).length > 0) {
                throw new Error(err.toString());
            }
        });
    }

    private generateRecord(o: {}): any[] {
        return Object.entries(o).map(([, v]) => (v instanceof Date ? moment(v).format('DD/MM/YYYY') : v));
    }

    public getId(): string {
        return this.id;
    }

    public getResult(): any[][] {
        if (this.payouts.length < 1) {
            return [];
        }

        // refactor(roy): into director
        this.setHeader();
        this.setDetails();
        this.setInvoice();
        this.setTrailer();

        // this.validate();
        return [
            this.generateRecord(this.header),
            ...this.details.map(d => this.generateRecord(d)),
            this.generateRecord(this.invoice),
            this.generateRecord(this.trailer),
        ];
    }
}
