import { ApiProperty } from '@nestjs/swagger';
import { Location } from '@shared/entities/location.entity';
import { Period } from '@shared/entities/period.entity';
import { AppointmentDto } from '@service-request/dto/appointment.dto';
import { ServiceRequestDto } from '@service-request/dto/service-request.dto';
import { ServiceDto } from '@service-request/dto/service.dto';
import { CustomerInvoiceDto } from './customer-invoice.dto';

export class JobRequestDto {
    @ApiProperty({
        description: 'A time period during which an appointment is applicable.',
    })
    appointment: AppointmentDto;

    @ApiProperty({
        description: 'A time period during which an appointment is applicable.',
    })
    expectedArrivalPeriod: Period;

    @ApiProperty({
        description: 'The address associated with service request',
    })
    customerAddress: Location;

    @ApiProperty({
        description: 'The invoice from customer.',
    })
    customerOrder: CustomerInvoiceDto;

    @ApiProperty({
        description: 'The unique identifier for the service request',
    })
    id: string;

    @ApiProperty({
        description: `A service is the actual execution of a ServiceRequest. 
        The work is to be fulfilled by the allocated Provider.`,
    })
    service: ServiceDto;

    public constructor(sr: ServiceRequestDto) {
        this.id = sr.id;
        this.expectedArrivalPeriod = sr.expectedArrivalPeriod;
        this.customerAddress = sr.customerAddress;
        this.customerOrder = new CustomerInvoiceDto(sr.customerOrder);
        this.appointment = sr.appointment;
        this.service = sr.service;
    }
}
