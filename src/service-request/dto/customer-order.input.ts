import { ApiProperty } from '@nestjs/swagger';
import { ServicePackageInput } from './service-package.input';

export class CustomerOrderInput {
    @ApiProperty({
        description: 'The remark from customer',
        nullable: true,
        example: 'Wait me at guardhouse will bring up once you arrived',
    })
    remarks?: string;

    @ApiProperty({
        description: 'Promotion code',
        nullable: true,
    })
    promoCode?: string;

    @ApiProperty({
        description: 'The service packages of a service request.',
        type: () => [ServicePackageInput],
    })
    servicePackages: ServicePackageInput[];

    @ApiProperty({
        description: `Total price (without discounts) of the requested service packages, based on
         the original unit price of the service package x quantity.`,
    })
    total: number;
}
