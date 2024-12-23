import { CustomerOrder } from './customer-order.entity';

function mockRequestedServicePackage({ serviceTypesEntitlement }) {
    return {
        changeServicePackageGroupQuantity: jest.fn(),
        hasTechnicalReportCompleted: jest.fn(),
        getServicePackageGroupCode: jest.fn(),
        getQuantity: jest.fn(),
        getServicePackageGroupQuantity: jest.fn(),
        getConsumerQuotationDiscountAmount: jest.fn(),
        getConsumerQuotationSubTotal: jest.fn(),
        getConsumerQuotationTotal: jest.fn(),
        getServiceProviderQuotationDiscountAmount: jest.fn(),
        getServiceProviderQuotationSubTotal: jest.fn(),
        getServiceProviderQuotationTotal: jest.fn(),
        getServiceTypesEntitlement: jest.fn(() => serviceTypesEntitlement),
        getTotalServiceMinutes: jest.fn(),
        toDto: jest.fn(),
    };
}
describe('Customer Order', () => {
    describe('calculate entitlement from requested service packages', () => {
        const rspWithSte1 = mockRequestedServicePackage({ serviceTypesEntitlement: 1 });
        const rspWithSte2 = mockRequestedServicePackage({ serviceTypesEntitlement: 2 });
        const rspWithSte4 = mockRequestedServicePackage({ serviceTypesEntitlement: 4 });
        const rspWithSte8 = mockRequestedServicePackage({ serviceTypesEntitlement: 8 });
        it.each`
            requestedServicePackages      | expectedServiceTypesEntitlement
            ${[rspWithSte1]}              | ${1}
            ${[rspWithSte2]}              | ${2}
            ${[rspWithSte4]}              | ${4}
            ${[rspWithSte8]}              | ${8}
            ${[rspWithSte1, rspWithSte8]} | ${9}
            ${[rspWithSte2, rspWithSte8]} | ${10}
            ${[rspWithSte4, rspWithSte8]} | ${12}
            ${[]}                         | ${0}
            ${[rspWithSte8, rspWithSte8]} | ${8}
        `(
            'returns %expectedServiceTypesEntitlement from new CustomerOrder({ %requestedServicePackages }).serviceTypesEntitlement',
            ({ requestedServicePackages, expectedServiceTypesEntitlement }) => {
                const co = new CustomerOrder('', requestedServicePackages);
                expect(co.serviceTypesEntitlement).toEqual(expectedServiceTypesEntitlement);
            },
        );
    });
});
