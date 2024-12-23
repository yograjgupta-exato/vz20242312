import { ApiProperty } from '@nestjs/swagger';
import { CustomerOrderDto } from '@service-request/dto/customer-order.dto';

export class CustomerInvoiceDto {
    @ApiProperty({
        description: `Total cost for Customer (without discounts) of the requested service packages, based on
         the original unit price of the service package x quantity.`,
    })
    consumerTotal!: number;

    @ApiProperty({
        description: 'The remark from customer',
        nullable: true,
        example: 'Wait me at guardhouse will bring up once you arrived',
    })
    remarks?: string;

    @ApiProperty({
        description: `Total earning for Service Provider (without discounts) of the requested service packages, based on
         the original unit price of the service package x quantity.`,
    })
    serviceProviderTotal!: number;

    public constructor(customerOrderDto: CustomerOrderDto) {
        this.consumerTotal = customerOrderDto.consumerTotal;
        this.remarks = customerOrderDto.remarks;
        this.serviceProviderTotal = customerOrderDto.serviceProviderTotal;
    }
}
