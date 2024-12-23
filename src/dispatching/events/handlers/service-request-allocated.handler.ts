import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { ServiceRequestAllocatedEvent } from '@cqrs/events/service-request.event';
import { Appointment } from 'dispatching/entities/appointment.entity';
import { AppointmentStatusEnum } from 'dispatching/enums/appointment-status.enum';

@EventsHandler(ServiceRequestAllocatedEvent)
export class ServiceRequestAllocatedHandler implements IEventHandler<ServiceRequestAllocatedEvent> {
    constructor(@InjectRepository(Appointment) private readonly allocationRepository: Repository<Appointment>) {}

    async handle(event: ServiceRequestAllocatedEvent) {
        const { serviceRequest } = event;
        await this.allocationRepository.update(
            {
                serviceRequestId: serviceRequest.getId(),
                provider: {
                    worker: {
                        id: Not(serviceRequest.getServiceProvider().worker.id),
                    },
                },
            },
            { status: AppointmentStatusEnum.REPLACED },
        );
    }
}
