import { ConsumerDisplayGroup } from '../consumer-display-group.entity';
import { ConsumerQuotation } from '../consumer-quotation.entity';
import { ServiceProviderQuotation } from '../service-provider-quotation.entity';

export interface IServicePackage {
    addConsumerQuotation(consumerQuotation: ConsumerQuotation): void;
    addServiceProviderQuotation(serviceProviderQuotation: ServiceProviderQuotation): void;
    lowestConsumerQuotationTierBasedOnQuantity(quantity: number): ConsumerQuotation;
    lowestServiceProviderQuotationTierBasedOnQuantity(quantity: number, state: string): ServiceProviderQuotation;
    getServicePackageGroupCode(): string;
    getUnitServiceMinutes(): number;
    getName(): string;
    getDescription(): string;
    getNoteToServiceProvider(): string;
    getServiceTypesEntitlement(): number;
    getConsumerDisplayGroup(): ConsumerDisplayGroup;
    getConsumerQuotations(): ConsumerQuotation[];
    getServiceProviderQuotations(): ServiceProviderQuotation[];
}
