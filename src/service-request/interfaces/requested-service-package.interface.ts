import { RequestedServicePackageDto } from '@service-request/dto/requested-service-package.dto';

export interface IRequestedServicePackage {
    changeServicePackageGroupQuantity(servicePackageGroupsQuantity: { [servicePackageGroupCode: string]: number }): void;
    hasTechnicalReportCompleted(): boolean;
    getServicePackageGroupCode(): string;
    getQuantity(): number;
    getServicePackageGroupQuantity(): number;
    getConsumerQuotationDiscountAmount(): number;
    getConsumerQuotationSubTotal(): number;
    getConsumerQuotationTotal(): number;
    getServiceProviderQuotationDiscountAmount(): number;
    getServiceProviderQuotationSubTotal(): number;
    getServiceProviderQuotationTotal(): number;
    getServiceTypesEntitlement(): number;
    getTotalServiceMinutes(): number;
    toDto(): RequestedServicePackageDto;
}
