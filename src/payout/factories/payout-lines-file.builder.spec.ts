import { BankSwiftCodes } from '../../shared/constants';
import { Tenant } from '../../shared/enums';
import { PayoutLine } from '../entities/payout-line.entity';
import { PayoutLineTypeEnum } from '../enums/payout-line-type.enum';
import { PayoutLinesFileBuilder } from './payout-lines-file.builder';

describe('Payout Lines File Builder', () => {
    // note(roy): if you need a different dataset, feel free to move into
    // describe blocks. Now, to save time, I'll reuse the same dataset.
    let payoutLinesFileBuilder: PayoutLinesFileBuilder = null;
    let payoutLineSr1Package1: PayoutLine = null;
    let payoutLineSr1Package2: PayoutLine = null;
    let payoutLineSr2Surcharge: PayoutLine = null;
    let payoutLineSr1Surcharge: PayoutLine = null;

    beforeEach(() => {
        payoutLineSr1Package1 = new PayoutLine();
        payoutLineSr1Package1.serviceRequestId = 'SR-1';
        payoutLineSr1Package1.itemType = PayoutLineTypeEnum.SERVICE_PACKAGE;
        payoutLineSr1Package1.principalGroup = Tenant.Daikin;
        payoutLineSr1Package1.itemRefId = 'SPack-1';
        payoutLineSr1Package1.itemDescription = 'service package 1\nitem1\titem2 ';
        payoutLineSr1Package1.ownerVendorId = 'V-1';
        payoutLineSr1Package1.bank = {
            accountNumber: 'BAC-1',
            swiftCode: BankSwiftCodes.affin_bank,
        };
        payoutLineSr1Package1.amount = 30;
        payoutLineSr1Package1.itemSalesAmount = 100;
        payoutLineSr1Package1.customerName = 'Mr. Roy';
        payoutLineSr1Package1.serviceProviderQuotationUnitPrice = 20;
        payoutLineSr1Package1.consumerQuotationUnitPrice = 90;

        payoutLineSr1Package2 = new PayoutLine();
        payoutLineSr1Package2.serviceRequestId = 'SR-1';
        payoutLineSr1Package2.itemType = PayoutLineTypeEnum.SERVICE_PACKAGE;
        payoutLineSr1Package2.principalGroup = Tenant.Daikin;
        payoutLineSr1Package2.itemRefId = 'SPack-2';
        payoutLineSr1Package2.itemDescription = 'service package 2\nitem1\titem2\r';
        payoutLineSr1Package2.ownerVendorId = 'V-1';
        payoutLineSr1Package2.bank = {
            accountNumber: 'BAC-1',
            swiftCode: BankSwiftCodes.affin_bank,
        };
        payoutLineSr1Package2.amount = 90;
        payoutLineSr1Package2.itemSalesAmount = 100;
        payoutLineSr1Package2.customerName = 'Mr. Roy';
        payoutLineSr1Package2.serviceProviderQuotationUnitPrice = 80;
        payoutLineSr1Package2.consumerQuotationUnitPrice = 90;

        payoutLineSr1Surcharge = new PayoutLine();
        payoutLineSr1Surcharge.serviceRequestId = 'SR-1';
        payoutLineSr1Surcharge.itemType = PayoutLineTypeEnum.RESCHEDULE_SURCHARGE;
        payoutLineSr1Surcharge.principalGroup = Tenant.Daikin;
        payoutLineSr1Surcharge.itemRefId = 'Surcharge';
        payoutLineSr1Surcharge.itemDescription = 'Surcharge';
        payoutLineSr1Surcharge.ownerVendorId = 'V-2';
        payoutLineSr1Surcharge.bank = {
            accountNumber: 'BAC-2',
            swiftCode: BankSwiftCodes.public_bank,
        };
        payoutLineSr1Surcharge.amount = 60;
        payoutLineSr1Surcharge.itemSalesAmount = 80;
        payoutLineSr1Surcharge.customerName = 'Mr. Roy';
        payoutLineSr1Surcharge.serviceProviderQuotationUnitPrice = 50;
        payoutLineSr1Surcharge.consumerQuotationUnitPrice = 70;

        payoutLineSr2Surcharge = new PayoutLine();
        payoutLineSr2Surcharge.serviceRequestId = 'SR-2';
        payoutLineSr2Surcharge.itemType = PayoutLineTypeEnum.RESCHEDULE_SURCHARGE;
        payoutLineSr2Surcharge.principalGroup = Tenant.Acson;
        payoutLineSr2Surcharge.itemRefId = 'Surcharge';
        payoutLineSr2Surcharge.itemDescription = 'Surcharge';
        payoutLineSr2Surcharge.ownerVendorId = 'V-3';
        payoutLineSr2Surcharge.bank = {
            accountNumber: 'BAC-3',
            swiftCode: BankSwiftCodes.jp_morgan_chase,
        };
        payoutLineSr2Surcharge.amount = 20;
        payoutLineSr2Surcharge.itemSalesAmount = 80;
        payoutLineSr2Surcharge.customerName = 'Mr. Lee';
        payoutLineSr2Surcharge.serviceProviderQuotationUnitPrice = 10;
        payoutLineSr2Surcharge.consumerQuotationUnitPrice = 70;

        payoutLinesFileBuilder = new PayoutLinesFileBuilder([
            payoutLineSr1Package1,
            payoutLineSr1Package2,
            payoutLineSr1Surcharge,
            payoutLineSr2Surcharge,
        ]);
    });

    describe('#getResult', () => {
        // refactor(roy): don't hard-code results
        it('should return csv-parsable results (1 header, 4 details)', () => {
            const results = payoutLinesFileBuilder.getResult();

            expect(results.length).toBe(5);
            // header
            expect(results[0]).toEqual([
                'Service_id',
                'Job_no',
                'Job_desc',
                'Item_ref',
                'Item_cost',
                'Item_single_unit_cost',
                'Item_price',
                'Item_single_unit_price',
                'Bank_acc',
                'Bank_code',
                'SAP_vendor',
            ]);

            // detail: sr-1
            expect(results[1]).toEqual([
                payoutLineSr1Package1.serviceRequestId,
                '1',
                payoutLineSr1Package1.itemDescription.replace(/(?:\r\n|\r|\n)/g, ' ').trim(),
                payoutLineSr1Package1.itemRefId.substr(0, 50).trim(),
                payoutLineSr1Package1.amount.toFixed(2),
                payoutLineSr1Package1.serviceProviderQuotationUnitPrice.toFixed(2),
                payoutLineSr1Package1.itemSalesAmount.toFixed(2),
                payoutLineSr1Package1.consumerQuotationUnitPrice.toFixed(2),
                payoutLineSr1Package1.bank.accountNumber,
                payoutLineSr1Package1.bank.swiftCode,
                payoutLineSr1Package1.ownerVendorId,
            ]);

            // detail: sr-1
            expect(results[2]).toEqual([
                payoutLineSr1Package2.serviceRequestId,
                '2',
                payoutLineSr1Package2.itemDescription.replace(/(?:\r\n|\r|\n)/g, ' ').trim(),
                payoutLineSr1Package2.itemRefId.trim(),
                payoutLineSr1Package2.amount.toFixed(2),
                payoutLineSr1Package2.serviceProviderQuotationUnitPrice.toFixed(2),
                payoutLineSr1Package2.itemSalesAmount.toFixed(2),
                payoutLineSr1Package2.consumerQuotationUnitPrice.toFixed(2),
                payoutLineSr1Package2.bank.accountNumber,
                payoutLineSr1Package2.bank.swiftCode,
                payoutLineSr1Package2.ownerVendorId,
            ]);

            // detail: sr-1
            expect(results[3]).toEqual([
                payoutLineSr1Surcharge.serviceRequestId,
                '3',
                payoutLineSr1Surcharge.itemDescription.replace(/(?:\r\n|\r|\n)/g, ' ').trim(),
                payoutLineSr1Surcharge.itemRefId.trim(),
                payoutLineSr1Surcharge.amount.toFixed(2),
                payoutLineSr1Surcharge.serviceProviderQuotationUnitPrice.toFixed(2),
                payoutLineSr1Surcharge.itemSalesAmount.toFixed(2),
                payoutLineSr1Surcharge.consumerQuotationUnitPrice.toFixed(2),
                payoutLineSr1Surcharge.bank.accountNumber,
                payoutLineSr1Surcharge.bank.swiftCode,
                payoutLineSr1Surcharge.ownerVendorId,
            ]);

            // detail: sr-2
            expect(results[4]).toEqual([
                payoutLineSr2Surcharge.serviceRequestId,
                '1',
                payoutLineSr2Surcharge.itemDescription.replace(/(?:\r\n|\r|\n)/g, ' ').trim(),
                payoutLineSr2Surcharge.itemRefId,
                payoutLineSr2Surcharge.amount.toFixed(2),
                payoutLineSr2Surcharge.serviceProviderQuotationUnitPrice.toFixed(2),
                payoutLineSr2Surcharge.itemSalesAmount.toFixed(2),
                payoutLineSr2Surcharge.consumerQuotationUnitPrice.toFixed(2),
                payoutLineSr2Surcharge.bank.accountNumber,
                payoutLineSr2Surcharge.bank.swiftCode,
                payoutLineSr2Surcharge.ownerVendorId,
            ]);
        });
    });
});
