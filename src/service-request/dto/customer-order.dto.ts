import { ApiProperty } from '@nestjs/swagger';
import { RequestedServicePackageDto } from './requested-service-package.dto';

export class CustomerOrderDto {
    @ApiProperty({
        description: 'Total discount amount for Consumer',
    })
    consumerDiscountAmount!: number;

    @ApiProperty({
        description: 'Total discount promotion amount for Consumer',
    })
    consumerPromotionAmount!: number;

    @ApiProperty({
        description: 'Promotion code applied',
    })
    consumerPromotionCode?: string;

    @ApiProperty({
        description: `SubTotal price for Customer (without discounts) of the requested service packages, based on
        the original unit price of the service package x quantity.`,
    })
    consumerSubTotal!: number;

    @ApiProperty({
        description: `Total price for Customer (after discounts) of the requested service packages, based on
        the discounted unit price of the service package x quantity.`,
    })
    consumerTotal!: number;

    @ApiProperty({
        description: 'The remark from customer',
        nullable: true,
        example: 'Wait me at guardhouse will bring up once you arrived',
    })
    remarks?: string;

    servicePackages!: RequestedServicePackageDto[];

    @ApiProperty({
        description: 'Total discount amount for Service Provider',
    })
    serviceProviderDiscountAmount!: number;

    @ApiProperty({
        description: `Total earning for Service Provider (without discounts) of the requested service packages, based on
        the original unit price of the service package x quantity.`,
    })
    serviceProviderSubTotal!: number;

    @ApiProperty({
        description: `Total earning for Service Provider (after discounts) of the requested service packages, based on
        the discounted unit price of the service package x quantity.`,
    })
    serviceProviderTotal!: number;
}
