import { validateSync } from 'class-validator';
import * as moment from 'moment';
import { PayoutLinesFileDetailDto, PayoutLinesFileHeaderDto } from '../dtos/payout-lines-file.dto';
import { PayoutLine } from '../entities/payout-line.entity';

export class PayoutLinesFileBuilder {
    header: PayoutLinesFileHeaderDto;
    details: PayoutLinesFileDetailDto[];
    payoutLines: PayoutLine[];

    public constructor(payoutLines: PayoutLine[]) {
        this.reset();
        this.payoutLines = payoutLines;
    }

    private setHeader() {
        this.header = new PayoutLinesFileHeaderDto();
    }

    private setDetails() {
        const serviceRequestJobCounter = {};
        this.details = this.payoutLines.map(line => {
            if (!serviceRequestJobCounter[line.serviceRequestId]) {
                serviceRequestJobCounter[line.serviceRequestId] = 0;
            }

            return new PayoutLinesFileDetailDto(
                line.serviceRequestId,
                (++serviceRequestJobCounter[line.serviceRequestId]).toString(),
                line.itemDescription,
                line.itemRefId,
                line.amount,
                line.serviceProviderQuotationUnitPrice,
                line.itemSalesAmount,
                line.consumerQuotationUnitPrice,
                line.bank?.accountNumber,
                line.bank?.swiftCode,
                line.ownerVendorId,
            );
        });
    }

    private validate(): void {
        const checks = [() => validateSync(this.header), () => this.details.map(d => validateSync(d))];

        checks.forEach(c => {
            const err = c();
            if (err.length > 0 && [].concat(err[0]).filter(elem => !!elem).length > 0) {
                throw new Error(err.toString());
            }
        });
    }

    private reset(): void {
        this.header = new PayoutLinesFileHeaderDto();
        this.details = [];
        this.payoutLines = [];
    }

    private generateRecord(o: {}): any[] {
        return Object.entries(o).map(([, v]) => (v instanceof Date ? moment(v).format('DD/MM/YYYY') : v));
    }

    public getResult(includeHeader = true): any[][] {
        if (this.payoutLines.length < 1) {
            return [];
        }

        const result = [];
        if (includeHeader) {
            this.setHeader();
            result.push(this.generateRecord(this.header));
        }

        this.setDetails();

        // note(roy): skip validation
        //this.validate();

        result.push(...this.details.map(d => this.generateRecord(d)));
        return result;
    }
}
