import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceRequestRescheduledEvent } from '@cqrs/events/service-request.event';
import { Assignment } from '../../entities/assignment.entity';
import { AppointmentStatusEnum } from '../../enums/appointment-status.enum';
import { AssignmentStatusEnum } from '../../enums/assignment-status.enum';
import { Appointment } from 'dispatching/entities/appointment.entity';

@EventsHandler(ServiceRequestRescheduledEvent)
export class ServiceRequestRescheduledHandler implements IEventHandler<ServiceRequestRescheduledEvent> {
    constructor(
        @InjectRepository(Assignment) private readonly assignmentRepository: Repository<Assignment>,
        @InjectRepository(Appointment) private readonly appointmentRepository: Repository<Appointment>,
    ) {}

    async handle(event: ServiceRequestRescheduledEvent) {
        const { serviceRequest, impactedServiceProviderId } = event;
        const provider = impactedServiceProviderId
            ? {
                  provider: {
                      dispatcher: {
                          id: impactedServiceProviderId,
                      },
                  },
              }
            : null;

        await this.assignmentRepository.update(
            {
                serviceRequestId: serviceRequest.getId(),
            },
            { status: AssignmentStatusEnum.RESCHEDULED },
        );

        await this.appointmentRepository.update(
            {
                serviceRequestId: serviceRequest.getId(),
                ...provider,
            },
            { status: AppointmentStatusEnum.RESCHEDULED },
        );
    }
}
