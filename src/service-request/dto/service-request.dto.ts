import { ApiProperty } from '@nestjs/swagger';
import { Period } from '@shared/entities/period.entity';
import { Tenant } from '@shared/enums';
import { Priority } from '@shared/enums/priority';
import { Refund } from '../../refund/refund.entity';
import { Rating } from '../entities/rating';
import { AppointmentDto } from './appointment.dto';
import { CustomerContactDto } from './customer-contact.dto';
import { CustomerOrderDto } from './customer-order.dto';
import { CustomerRescheduleOrderDto } from './customer-reschedule-order.dto';
import { LocationDto } from './location.dto';
import { ServiceDto } from './service.dto';

export class ServiceRequestDto {
    @ApiProperty({
        description: 'A time period during which an appointment is applicable.',
    })
    appointment: AppointmentDto;

    @ApiProperty({
        description: 'A time period during which an appointment is applicable.',
    })
    expectedArrivalPeriod: Period;

    @ApiProperty({
        description: 'The address associated with service ticket',
    })
    customerAddress: LocationDto;

    @ApiProperty({
        description: 'Contact information about the customer.',
    })
    customerContact: CustomerContactDto;

    @ApiProperty({
        description: 'Order information from customer.',
    })
    customerOrder: CustomerOrderDto;

    @ApiProperty({
        description: 'Reschedule Order information from customer.',
    })
    customerRescheduleOrder: CustomerRescheduleOrderDto;

    @ApiProperty({
        description: 'The unique identifier for the service request.',
    })
    id: string;

    @ApiProperty({
        description: 'It describes the level of urgency on the service.',
        type: 'enum',
    })
    priority: Priority;

    @ApiProperty({
        description: 'The 5 digits security-code as a contract between Customer and Service Provider',
        nullable: true,
    })
    securityCode?: string;

    @ApiProperty({
        description: 'The 5 digits verification-code used to verify the job is completed',
        nullable: true,
    })
    verificationCode?: string;

    @ApiProperty({
        description: `A service is the actual execution of a ServiceRequest.
        The work is to be fulfilled by the allocated Provider.`,
    })
    service: ServiceDto;

    @ApiProperty({
        description: 'The Servicing Report Url.',
        nullable: true,
    })
    serviceReportUrl?: string;

    createdAt: Date;
    updatedAt: Date;

    @ApiProperty({
        description: 'Date of rescheduling. Each booking allows 1-time reschedule, 179 minutes prior appointment',
        nullable: true,
    })
    rescheduledAt: Date;

    principalGroup: Tenant;

    principalGroupName: string;

    externalCustomerId?: string;

    paymentMethod?: string;

    crmCustomerId?: string;

    rating: Rating;

    allowReschedule: boolean;

    allowCancel: boolean;

    refund: Refund;
}
