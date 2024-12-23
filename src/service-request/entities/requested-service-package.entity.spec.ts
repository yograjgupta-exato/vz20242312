import { TechnicalNoteDto } from '@service-request/dto/technical-note.dto';
import { ConsumerQuotation } from '../../service-package/entities/consumer-quotation.entity';
import { ServicePackage } from '../../service-package/entities/service-package.entity';
import { ServiceProviderQuotation } from '../../service-package/entities/service-provider-quotation.entity';
import { RequestedServicePackage } from './requested-service-package.entity';

const STATE_KL = 'Kuala Lumpur';
const spQuotationMinQuantity5 = new ServiceProviderQuotation({
    minQuantity: 5,
    state: STATE_KL,
    unitPrice: 250,
});
const spQuotationMinQuantity1 = new ServiceProviderQuotation({
    minQuantity: 1,
    state: STATE_KL,
    unitPrice: 100,
});
const spQuotationMinQuantity2 = new ServiceProviderQuotation({
    minQuantity: 2,
    state: STATE_KL,
    unitPrice: 180,
});

const cQuotationMinQuantity5 = new ConsumerQuotation({
    minQuantity: 5,
    unitPrice: 250,
});
const cQuotationMinQuantity1 = new ConsumerQuotation({
    minQuantity: 1,
    unitPrice: 100,
});
const cQuotationMinQuantity2 = new ConsumerQuotation({
    minQuantity: 2,
    unitPrice: 180,
});

function seedServicePackage(): ServicePackage {
    const servicePackage = new ServicePackage();
    servicePackage.addConsumerQuotation(cQuotationMinQuantity5);
    servicePackage.addConsumerQuotation(cQuotationMinQuantity1);
    servicePackage.addConsumerQuotation(cQuotationMinQuantity2);

    servicePackage.addServiceProviderQuotation(spQuotationMinQuantity5);
    servicePackage.addServiceProviderQuotation(spQuotationMinQuantity1);
    servicePackage.addServiceProviderQuotation(spQuotationMinQuantity2);

    return servicePackage;
}

describe('Requested Service Package Entity', () => {
    describe('# changeQuantity', () => {
        describe('ramifications on technical report', () => {
            let requestedServicePackage: RequestedServicePackage;
            let note1: TechnicalNoteDto;

            beforeEach(() => {
                requestedServicePackage = new RequestedServicePackage(0, STATE_KL, seedServicePackage());
                note1 = new TechnicalNoteDto('1');
            });

            it('regenerates and completely replaced old technical report with `incomplete` status when requested quantity is changed', () => {
                const beforeQuantity = 1;
                const afterQuantity = 2;

                requestedServicePackage.changeQuantity(beforeQuantity);
                note1.imageUrls = [];
                note1.model = 'model';
                note1.serviceSummary = 'serviceSummary';
                note1.serialNumber = 'serialNumber';

                expect(requestedServicePackage.technicalReport.hasBeenCompleted()).toEqual(false);
                requestedServicePackage.replaceNotesInTechnicalReport([note1]);
                expect(requestedServicePackage.technicalReport.hasBeenCompleted()).toEqual(true);

                requestedServicePackage.changeQuantity(afterQuantity);
                expect(requestedServicePackage.technicalReport.hasBeenCompleted()).toEqual(false);
            });

            it('should not regenerate technical report when requested quantity has not been changed', () => {
                const beforeQuantity = 1;
                const afterQuantity = 1;

                requestedServicePackage.changeQuantity(beforeQuantity);
                note1.imageUrls = [];
                note1.model = 'model';
                note1.serviceSummary = 'serviceSummary';
                note1.serialNumber = 'serialNumber';

                expect(requestedServicePackage.technicalReport.hasBeenCompleted()).toEqual(false);
                requestedServicePackage.replaceNotesInTechnicalReport([note1]);
                expect(requestedServicePackage.technicalReport.hasBeenCompleted()).toEqual(true);

                requestedServicePackage.changeQuantity(afterQuantity);
                expect(requestedServicePackage.technicalReport.hasBeenCompleted()).toEqual(true);
            });
        });

        describe('ramification on consumer quotations', () => {
            let rsp: RequestedServicePackage;

            it.each`
                quantity | expectedOriginalQuotation | expectedDiscountedQuotation
                ${4}     | ${cQuotationMinQuantity1} | ${cQuotationMinQuantity2}
                ${100}   | ${cQuotationMinQuantity1} | ${cQuotationMinQuantity5}
                ${0}     | ${cQuotationMinQuantity1} | ${cQuotationMinQuantity1}
            `(
                'returns %expectedOriginalQuotation and %expectedDiscountedQuotation when quantity = %quantity',
                ({ quantity, expectedOriginalQuotation, expectedDiscountedQuotation }) => {
                    rsp = new RequestedServicePackage(0, STATE_KL, seedServicePackage());
                    rsp.changeQuantity(quantity);
                    expect(rsp.consumerQuotationTotal).toEqual(quantity * expectedDiscountedQuotation.unitPrice);
                    expect(rsp.consumerQuotationMinQuantity).toEqual(expectedDiscountedQuotation.minQuantity);
                    expect(rsp.consumerQuotationDiscountedUnitPrice).toEqual(expectedDiscountedQuotation.unitPrice);
                    expect(rsp.consumerQuotationUnitPrice).toEqual(expectedOriginalQuotation.unitPrice);
                    expect(rsp.consumerQuotationSubTotal).toEqual(quantity * expectedOriginalQuotation.unitPrice);
                },
            );
        });

        describe('ramification on service provider quotations', () => {
            let rsp: RequestedServicePackage;

            it.each`
                quantity | expectedOriginalQuotation  | expectedDiscountedQuotation
                ${4}     | ${spQuotationMinQuantity1} | ${spQuotationMinQuantity2}
                ${100}   | ${spQuotationMinQuantity1} | ${spQuotationMinQuantity5}
                ${0}     | ${spQuotationMinQuantity1} | ${spQuotationMinQuantity1}
            `(
                'returns %expectedOriginalQuotation and %expectedDiscountedQuotation when quantity = %quantity',
                ({ quantity, expectedOriginalQuotation, expectedDiscountedQuotation }) => {
                    rsp = new RequestedServicePackage(0, STATE_KL, seedServicePackage());
                    rsp.changeQuantity(quantity);
                    expect(rsp.serviceProviderQuotationTotal).toEqual(quantity * expectedDiscountedQuotation.unitPrice);
                    expect(rsp.serviceProviderQuotationMinQuantity).toEqual(expectedDiscountedQuotation.minQuantity);
                    expect(rsp.serviceProviderQuotationDiscountedUnitPrice).toEqual(expectedDiscountedQuotation.unitPrice);
                    expect(rsp.serviceProviderQuotationUnitPrice).toEqual(expectedOriginalQuotation.unitPrice);
                    expect(rsp.serviceProviderQuotationSubTotal).toEqual(quantity * expectedOriginalQuotation.unitPrice);
                },
            );
        });
    });
});
