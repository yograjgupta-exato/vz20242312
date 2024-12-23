import moment = require('moment');
import { Tenant } from '../../shared/enums';
import { AMSS_COMPANY_CODE, DMSS_COMPANY_CODE } from '../dtos/payout-summary-file.dto';
import { PayoutLine } from '../entities/payout-line.entity';
import { PayoutLineTypeEnum } from '../enums/payout-line-type.enum';
import { PayoutSummaryFileBuilder } from './payout-summary-file.builder';

describe('Payout Summary File Builder', () => {
    // note(roy): if you need a different dataset, feel free to move into
    // describe blocks. Now, to save time, I'll reuse the same dataset.
    let payoutSummaryFileBuilder: PayoutSummaryFileBuilder = null;
    let payoutLineSr1Package1: PayoutLine = null;
    let payoutLineSr1Package2: PayoutLine = null;
    let payoutLineSr2Surcharge: PayoutLine = null;
    let payoutLineSr1Surcharge: PayoutLine = null;
    let now = null;

    beforeEach(() => {
        payoutLineSr1Package1 = new PayoutLine();
        payoutLineSr1Package1.serviceRequestId = 'SR-1';
        payoutLineSr1Package1.itemType = PayoutLineTypeEnum.SERVICE_PACKAGE;
        payoutLineSr1Package1.principalGroup = Tenant.Daikin;
        payoutLineSr1Package1.amount = 30;
        payoutLineSr1Package1.itemSalesAmount = 100;
        payoutLineSr1Package1.consumerPromotionAmount = 0.0;
        payoutLineSr1Package1.customerName = 'Mr. Roy';
        payoutLineSr1Package1.consumerPromotionCode = '';
        payoutLineSr1Package1.consumerPromotionAmount = 0.0;

        payoutLineSr1Package2 = new PayoutLine();
        payoutLineSr1Package2.serviceRequestId = 'SR-1';
        payoutLineSr1Package2.itemType = PayoutLineTypeEnum.SERVICE_PACKAGE;
        payoutLineSr1Package2.principalGroup = Tenant.Daikin;
        payoutLineSr1Package2.amount = 90;
        payoutLineSr1Package2.itemSalesAmount = 100;
        payoutLineSr1Package2.customerName = 'Mr. Roy';
        payoutLineSr1Package2.consumerPromotionCode = '';
        payoutLineSr1Package2.consumerPromotionAmount = 0.0;

        payoutLineSr1Surcharge = new PayoutLine();
        payoutLineSr1Surcharge.serviceRequestId = 'SR-1';
        payoutLineSr1Surcharge.itemType = PayoutLineTypeEnum.RESCHEDULE_SURCHARGE;
        payoutLineSr1Surcharge.principalGroup = Tenant.Daikin;
        payoutLineSr1Surcharge.amount = 60;
        payoutLineSr1Surcharge.itemSalesAmount = 80;
        payoutLineSr1Surcharge.customerName = 'Mr. Roy';
        payoutLineSr1Surcharge.consumerPromotionCode = '';
        payoutLineSr1Surcharge.consumerPromotionAmount = 0.0;

        payoutLineSr2Surcharge = new PayoutLine();
        payoutLineSr2Surcharge.serviceRequestId = 'SR-2';
        payoutLineSr2Surcharge.itemType = PayoutLineTypeEnum.RESCHEDULE_SURCHARGE;
        payoutLineSr2Surcharge.principalGroup = Tenant.Acson;
        payoutLineSr2Surcharge.amount = 20;
        payoutLineSr2Surcharge.itemSalesAmount = 80;
        payoutLineSr2Surcharge.customerName = 'Mr. Lee';
        payoutLineSr2Surcharge.consumerPromotionCode = '';
        payoutLineSr2Surcharge.consumerPromotionAmount = 0.0;

        now = new Date();

        payoutSummaryFileBuilder = new PayoutSummaryFileBuilder(
            [payoutLineSr1Package1, payoutLineSr1Package2, payoutLineSr1Surcharge, payoutLineSr2Surcharge],
            now,
        );
    });

    describe('#groupPayoutLinesByServiceRequest', () => {
        // refactor(roy): to proper payout groups
        it('should return grouped service request lines (payout)', () => {
            const results = payoutSummaryFileBuilder.groupPayoutLinesByServiceRequest();

            expect(results.length).toBe(2);
            expect(results[0].serviceRequestId).toBe('SR-1');
            expect(results[0].amount).toBe(payoutLineSr1Package1.amount + payoutLineSr1Package2.amount + payoutLineSr1Surcharge.amount);
            expect(results[0].itemSalesAmount).toBe(
                payoutLineSr1Package1.itemSalesAmount + payoutLineSr1Package2.itemSalesAmount + payoutLineSr1Surcharge.itemSalesAmount,
            );
            expect(results[1].serviceRequestId).toBe('SR-2');
            expect(results[1].amount).toBe(payoutLineSr2Surcharge.amount);
            expect(results[1].itemSalesAmount).toBe(payoutLineSr2Surcharge.itemSalesAmount);
        });
    });

    describe('#getResult', () => {
        // refactor(roy): don't hard-code results
        it('should return csv-parsable results (1 header, 2 details)', () => {
            const results = payoutSummaryFileBuilder.getResult();

            expect(results.length).toBe(3);
            // header
            expect(results[0]).toEqual([
                'Service_id',
                'Comp_no',
                'Doc_date',
                'Head_text',
                'Cost',
                'Sales',
                'Promo_code',
                'Promo_code_amt',
                'Surcharge_Vendor_ID',
                'Service_Vendor_ID',
            ]);
            // detail: sr-1
            expect(results[1]).toEqual([
                'SR-1',
                DMSS_COMPANY_CODE,
                moment(now).format('DD/MM/YYYY'),
                'Consumer: Mr. Roy',
                '180.00',
                '280.00',
                '',
                '0.00',
                '',
                '',
            ]);
            // detail: sr-2
            expect(results[2]).toEqual([
                'SR-2',
                AMSS_COMPANY_CODE,
                moment(now).format('DD/MM/YYYY'),
                'Consumer: Mr. Lee',
                '20.00',
                '80.00',
                '',
                '0.00',
                '',
                '',
            ]);
        });
    });
});
