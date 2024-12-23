import { ApiProperty } from '@nestjs/swagger';
import { TechnicalReportDto } from './technical-report.dto';

export class RequestedServicePackageDto {
    @ApiProperty({
        description: 'The value of the discount for consumer.',
    })
    consumerQuotationDiscountAmount: number;
    consumerQuotationDiscountedUnitPrice!: number;
    consumerQuotationMinQuantity!: number;
    consumerQuotationSubTotal: number;
    consumerQuotationTotal: number;
    consumerQuotationUnitPrice!: number;
    description: string;
    name: string;
    noteToServiceProvider: string;

    quantity!: number;
    servicePackageId!: string;
    @ApiProperty({
        description: 'The value of the discount for service provider.',
    })
    serviceProviderQuotationDiscountAmount: number;
    serviceProviderQuotationDiscountedUnitPrice!: number;
    serviceProviderQuotationMinQuantity!: number;
    serviceProviderQuotationSubTotal: number;
    serviceProviderQuotationTotal!: number;
    serviceProviderQuotationUnitPrice!: number;
    serviceProviderQuotationState!: string;
    serviceRequestId!: string;
    technicalReport: TechnicalReportDto;
}
