/* eslint-disable max-len */
import { validate } from 'class-validator';
import * as moment from 'moment';
import { ScbPaymentDetailDto, ScbPaymentHeaderDto, ScbPaymentInvoiceDto, ScbPaymentTrailerDto } from './scb-payment.dto';

describe('SCB Payment CSV Conversion', () => {
    it('maps header to corresponded csv format', async () => {
        const recordType = 'H';
        const fileType = 'P';

        const model = new ScbPaymentHeaderDto();
        const errors = await validate(model);
        expect(errors.length).toEqual(0);

        const output = Object.entries(model)
            .map(([, v]) => (v instanceof Date ? moment(v).format('DD/MM/YYYY') : v))
            .join(',');
        expect(output.split(',').length).toEqual(2);
        expect(output).toEqual(`${recordType},${fileType}`);
    });

    it('maps detail to corresponded csv format', async () => {
        const recordType = 'P';
        const paymentType = 'ACH';
        const processingMode = 'BA';
        const customerReference = 'ZP.22000131314';
        const accountNo = '794146964118';
        const cityCode = 'KUL';
        const paymentDate = new Date(2019, 1, 19);
        const payeeName = 'AMADA (MALAYSIA) SDN BHD';
        const payeeAddress1 = 'Address 1';
        const payeeAddress2 = 'Address 2';
        const payeeAddress = payeeAddress1 + payeeAddress2;

        const payeeBankCode = 'MBBEMYKLXXX';
        const beneficiaryAcNo = '512222117252';
        const invoiceOrGrossAmount = 2000.0;
        const purposeOfPaymentTransactionId = '21220';

        const beneficiaryEmail = 'scng@amada.co.jp';

        const model = new ScbPaymentDetailDto(
            customerReference,
            accountNo,
            cityCode,
            paymentDate,
            payeeName,
            payeeAddress,
            payeeBankCode,
            beneficiaryAcNo,
            invoiceOrGrossAmount,
            beneficiaryEmail,
        );

        const errors = await validate(model);
        expect(errors).toEqual([]);

        const output = Object.entries(model)
            .map(([, v]) => (v instanceof Date ? moment(v).format('DD/MM/YYYY') : v))
            .join(',');

        const expected = `${recordType},${paymentType},${processingMode},,${customerReference},,MY,${cityCode},${accountNo},${moment(
            paymentDate,
        ).format('DD/MM/YYYY')},${payeeName},${payeeAddress.slice(0, 40)},${payeeAddress.slice(
            40,
            80,
        )},MY,,${payeeBankCode},,,,${beneficiaryAcNo},,,,,,,,,,,,,,,,,4,MYR,${invoiceOrGrossAmount.toFixed(
            2,
        )},,,,,,,,,,,,,,,,,,,,,,,,${beneficiaryEmail},,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,${purposeOfPaymentTransactionId},,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,`;
        expect(output.split(',').length).toEqual(207);
        expect(output).toEqual(expected);
    });

    it('maps invoice to corresponded csv format', async () => {
        const recordType = 'I';
        const invoiceReference = 'ref';
        const invoiceDate = new Date(2019, 1, 19);
        const invoiceDescription = 'desc';
        const invoiceAmount = 2000.0;

        const model = new ScbPaymentInvoiceDto(invoiceReference, invoiceDate, invoiceDescription, invoiceAmount);
        const errors = await validate(model);
        expect(errors).toEqual([]);

        const output = Object.entries(model)
            .map(([, v]) => (v instanceof Date ? moment(v).format('DD/MM/YYYY') : v))
            .join(',');
        expect(output.split(',').length).toEqual(5);
        expect(output).toEqual(
            `${recordType},${invoiceReference},${moment(invoiceDate).format('DD/MM/YYYY')},${invoiceDescription},${invoiceAmount.toFixed(2)}`,
        );
    });

    it('maps trailer to corresponded csv format', async () => {
        const recordType = 'T';
        const totalNumberOfRecords = 1;
        const totalInvoiceAmount = 2000.0;

        const model = new ScbPaymentTrailerDto(totalNumberOfRecords, totalInvoiceAmount);
        const errors = await validate(model);
        expect(errors).toEqual([]);

        const output = Object.entries(model)
            .map(([, v]) => (v instanceof Date ? moment(v).format('DD/MM/YYYY') : v))
            .join(',');
        expect(output.split(',').length).toEqual(3);
        expect(output).toEqual(`${recordType},${totalNumberOfRecords},${totalInvoiceAmount.toFixed(2)}`);
    });
});
