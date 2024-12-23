import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import * as moment from 'moment';
import { PayoutSummaryFileDetailDto, PayoutSummaryFileHeaderDto } from '../dtos/payout-summary-file.dto';
import { PayoutLine } from '../entities/payout-line.entity';
import { PayoutLineTypeEnum } from '../enums/payout-line-type.enum';

class PayoutSummary extends PayoutLine {
    hasServiceFee: boolean;
    hasRescheduleSurcharge: boolean;
    constructor() {
        super();
        this.hasServiceFee = false;
        this.hasRescheduleSurcharge = false;
    }
}

export class PayoutSummaryFileBuilder {
    header: PayoutSummaryFileHeaderDto;
    details: PayoutSummaryFileDetailDto[];
    now: Date;
    payoutLines: PayoutLine[];
    payoutSummaries: PayoutSummary[];

    public constructor(payoutLines: PayoutLine[], now = new Date()) {
        this.reset();
        this.now = now;
        this.payoutLines = payoutLines;
        this.payoutSummaries = this.groupPayoutLinesByServiceRequest();
    }

    private reset(): void {
        this.header = new PayoutSummaryFileHeaderDto();
        this.details = [];
        this.now = null;
        this.payoutLines = [];
        this.payoutSummaries = [];
    }

    /**
     *  Group payoutLines[] by service-request-id (service-request),
     */
    public groupPayoutLinesByServiceRequest(): PayoutSummary[] {
        let groupedPayoutLinesByServiceRequest: { [id: string]: PayoutLine[] } = {};

        groupedPayoutLinesByServiceRequest = this.payoutLines.reduce((groupedByServiceRequest, line) => {
            groupedByServiceRequest[line.serviceRequestId] = groupedByServiceRequest[line.serviceRequestId] ?? [];
            groupedByServiceRequest[line.serviceRequestId].push(line);
            return groupedByServiceRequest;
        }, {});

        const payoutSummaries: PayoutSummary[] = Object.entries(groupedPayoutLinesByServiceRequest).map(([_, lines]) => {
            const totalAmount = lines.reduce((sum, line) => sum + line.amount, 0);
            const totalSalesAmount = lines.reduce((sum, line) => sum + line.itemSalesAmount, 0);

            const payoutSummary = plainToClass(PayoutSummary, { ...lines[0] });
            payoutSummary.amount = totalAmount;
            payoutSummary.itemSalesAmount = totalSalesAmount;
            payoutSummary.hasServiceFee = lines.filter(line => line.itemType === PayoutLineTypeEnum.SERVICE_PACKAGE).length > 0;
            payoutSummary.hasRescheduleSurcharge = lines.filter(line => line.itemType === PayoutLineTypeEnum.RESCHEDULE_SURCHARGE).length > 0;
            return payoutSummary;
        });

        return payoutSummaries;
    }
    private setHeader() {
        this.header = new PayoutSummaryFileHeaderDto();
    }

    private setDetails() {
        this.details = this.payoutSummaries.map(
            line =>
                new PayoutSummaryFileDetailDto(
                    line.serviceRequestId,
                    line.principalGroup,
                    `Consumer: ${line.customerName}`,
                    line.amount,
                    line.itemSalesAmount - (line.consumerPromotionAmount || 0),
                    line.consumerPromotionCode,
                    line.consumerPromotionAmount,
                    line.hasServiceFee ? line.ownerVendorId : '',
                    line.hasRescheduleSurcharge ? line.ownerVendorId : '',
                ),
        );
    }

    // refactor(roy): into abstract class for reusable constraints
    private validate(): void {
        const checks = [() => validateSync(this.header), () => this.details.map(d => validateSync(d))];

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
    /**
     * a ubiquitous double array raw content, which you can later
     *  use to generate into various file formats.
     * @returns any[][]
     */
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
