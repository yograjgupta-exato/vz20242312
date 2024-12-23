import { Injectable } from '@nestjs/common';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { AppointmentStatusEnum } from '../../enums/appointment-status.enum';
import { Appointment } from '../appointment.entity';

@Injectable()
export class AppointmentFactory {
    public static create(serviceRequest: IServiceRequest): Appointment {
        // refactor(roy): add constructor on entity
        const allocation = new Appointment();

        allocation.serviceRequestId = serviceRequest.getId();
        allocation.provider = serviceRequest.getServiceProvider();
        allocation.status = AppointmentStatusEnum.ALLOCATED;
        return allocation;
    }
}
