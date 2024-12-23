import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceRequestFulfilledEvent } from '@cqrs/events/service-request.event';
import { Appointment } from '../../entities/appointment.entity';
import { AppointmentStatusEnum } from '../../enums/appointment-status.enum';

@EventsHandler(ServiceRequestFulfilledEvent)
export class DispatchingServiceRequestFulfilledHandler implements IEventHandler<ServiceRequestFulfilledEvent> {
    constructor(@InjectRepository(Appointment) private readonly allocationRepository: Repository<Appointment>) {}

    async handle(event: ServiceRequestFulfilledEvent) {
        const { serviceRequest } = event;
        await this.allocationRepository.update(
            {
                serviceRequestId: serviceRequest.getId(),
                provider: {
                    worker: {
                        id: serviceRequest.getServiceProvider().worker.id,
                    },
                },
            },
            { status: AppointmentStatusEnum.FULFILLED },
        );
    }
}
