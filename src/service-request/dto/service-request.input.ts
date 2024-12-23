import { ApiProperty } from '@nestjs/swagger';
import { Tenant } from '@shared/enums';
import { CustomerContactInput } from './customer-contact.input';
import { CustomerOrderInput } from './customer-order.input';
import { LocationInput } from './location.input';
import { PeriodInput } from './period.input';

export class ServiceRequestInput {
    @ApiProperty({
        description: 'Service category, either DMSS or AMSS.',
    })
    requestCategory: Tenant = Tenant.Daikin;

    @ApiProperty({
        description: 'A time period during which an appointment is applicable.',
    })
    expectedArrivalPeriod: PeriodInput;

    @ApiProperty({
        description: 'The address associated with service ticket',
    })
    customerAddress: LocationInput;

    @ApiProperty({
        description: 'Contact information about the customer.',
    })
    customerContact: CustomerContactInput;

    @ApiProperty({
        description: 'Order information from customer.',
    })
    customerOrder: CustomerOrderInput;

    @ApiProperty({
        description: 'Customer ID that referenced from external system.',
    })
    externalCustomerId?: string;
}
