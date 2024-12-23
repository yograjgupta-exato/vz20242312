import { ServiceType } from '../../service-type/service-type.entity';
import { ConsumerQuotation } from './consumer-quotation.entity';
import { ServicePackage } from './service-package.entity';
import { ServiceProviderQuotation } from './service-provider-quotation.entity';
function assignStateToQuotations(quotations: ServiceProviderQuotation[], state: string): ServiceProviderQuotation[] {
    return quotations.map(quotation => ({
        ...quotation,
        state,
    }));
}

function addServiceProviderQuotationsToServicePackage(servicePackage: ServicePackage, quotations: ServiceProviderQuotation[]): void {
    quotations.forEach(quotation => servicePackage.addServiceProviderQuotation(quotation));
}

describe('Service Package', () => {
    const STATE_KL = 'Kuala Lumpur';
    const STATE_SABAH = 'Sabah';

    describe('# lowestConsumerQuotationTierBasedOnQuantity', () => {
        const quotationWithMinQuantity5 = new ConsumerQuotation({
            minQuantity: 5,
            unitPrice: 250,
        });
        const quotationWithMinQuantity1 = new ConsumerQuotation({
            minQuantity: 1,
            unitPrice: 100,
        });
        const quotationWithMinQuantity2 = new ConsumerQuotation({
            minQuantity: 2,
            unitPrice: 180,
        });

        const servicePackage = new ServicePackage();
        servicePackage.addConsumerQuotation(quotationWithMinQuantity5);
        servicePackage.addConsumerQuotation(quotationWithMinQuantity1);
        servicePackage.addConsumerQuotation(quotationWithMinQuantity2);

        it.each`
            quantity | expectedQuotation
            ${100}   | ${quotationWithMinQuantity5}
            ${3}     | ${quotationWithMinQuantity2}
            ${1}     | ${quotationWithMinQuantity1}
        `('returns %expectedQuotation when lowestConsumerQuotationTierBasedOnQuantity(%quantity) ', ({ quantity, expectedQuotation }) => {
            expect(servicePackage.lowestConsumerQuotationTierBasedOnQuantity(quantity)).toEqual(expectedQuotation);
        });
    });

    describe('# lowestServiceProviderQuotationTierBasedOnQuantity', () => {
        const quotationWithMinQuantity1 = new ServiceProviderQuotation({
            minQuantity: 1,
            unitPrice: 100,
        });
        const quotationWithMinQuantity2 = new ServiceProviderQuotation({
            minQuantity: 2,
            unitPrice: 180,
        });
        const quotationWithMinQuantity5 = new ServiceProviderQuotation({
            minQuantity: 5,
            unitPrice: 250,
        });

        // note(roy): [before/after][all/each] doesn't work in .each:
        // - https://github.com/facebook/jest/issues/7100,
        // - https://github.com/facebook/jest/issues/6888
        const servicePackage: ServicePackage = new ServicePackage();
        addServiceProviderQuotationsToServicePackage(
            servicePackage,
            assignStateToQuotations([quotationWithMinQuantity1, quotationWithMinQuantity2, quotationWithMinQuantity5], STATE_KL),
        );
        addServiceProviderQuotationsToServicePackage(
            servicePackage,
            assignStateToQuotations([quotationWithMinQuantity1, quotationWithMinQuantity2, quotationWithMinQuantity5], STATE_SABAH),
        );

        it.each`
            quantity | state          | expectedState  | expectedQuotation
            ${100}   | ${STATE_KL}    | ${STATE_KL}    | ${quotationWithMinQuantity5}
            ${3}     | ${STATE_KL}    | ${STATE_KL}    | ${quotationWithMinQuantity2}
            ${1}     | ${STATE_KL}    | ${STATE_KL}    | ${quotationWithMinQuantity1}
            ${1}     | ${STATE_SABAH} | ${STATE_SABAH} | ${quotationWithMinQuantity1}
            ${90}    | ${STATE_SABAH} | ${STATE_SABAH} | ${quotationWithMinQuantity5}
        `(
            'returns %expectedQuotation of $expectedState when lowestServiceProviderQuotationTierBasedOnQuantity(%quantity, %state) ',
            ({ quantity, state, expectedState, expectedQuotation }) => {
                expect(servicePackage.lowestServiceProviderQuotationTierBasedOnQuantity(quantity, state)).toEqual({
                    ...expectedQuotation,
                    state: expectedState,
                });
            },
        );
    });

    describe('calculate entitlement from service-types', () => {
        const stBitFlag1 = new ServiceType();
        stBitFlag1.bitFlag = 1;
        const stBitFlag2 = new ServiceType();
        stBitFlag2.bitFlag = 2;
        const stBitFlag4 = new ServiceType();
        stBitFlag4.bitFlag = 4;
        const stBitFlag8 = new ServiceType();
        stBitFlag8.bitFlag = 8;

        it.each`
            serviceTypes                | expectedServiceTypesEntitlement
            ${[stBitFlag1]}             | ${1}
            ${[stBitFlag2]}             | ${2}
            ${[stBitFlag4]}             | ${4}
            ${[stBitFlag8]}             | ${8}
            ${[stBitFlag1, stBitFlag8]} | ${9}
            ${[stBitFlag2, stBitFlag8]} | ${10}
            ${[stBitFlag4, stBitFlag8]} | ${12}
            ${[]}                       | ${0}
            ${[stBitFlag8, stBitFlag8]} | ${8}
        `(
            'returns %expectedServiceTypesEntitlement on new ServicePackage({ %serviceTypes }).getServiceTypesEntitlement()',
            ({ serviceTypes, expectedServiceTypesEntitlement }) => {
                const sp = new ServicePackage({ serviceTypes });
                expect(sp.getServiceTypesEntitlement()).toEqual(expectedServiceTypesEntitlement);
            },
        );
    });
});
