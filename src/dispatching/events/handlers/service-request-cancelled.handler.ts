import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceRequestCancelledEvent } from '@cqrs/events/service-request.event';
import { Assignment } from '../../entities/assignment.entity';
import { AppointmentStatusEnum } from '../../enums/appointment-status.enum';
import { AssignmentStatusEnum } from '../../enums/assignment-status.enum';
import { Appointment } from 'dispatching/entities/appointment.entity';

@EventsHandler(ServiceRequestCancelledEvent)
export class ServiceRequestCancelledHandler implements IEventHandler<ServiceRequestCancelledEvent> {
    constructor(
        @InjectRepository(Assignment) private readonly assignmentRepository: Repository<Assignment>,
        @InjectRepository(Appointment) private readonly appointmentRepository: Repository<Appointment>,
    ) {}

    // todo(roy): inaccurate as all of previous appointments will be replaced by 'CANCELLED' instead.
    // however low-priority as of now (compared to itemized payout)
    async handle(event: ServiceRequestCancelledEvent) {
        const { serviceRequest } = event;

        await this.assignmentRepository.update(
            {
                serviceRequestId: serviceRequest.getId(),
            },
            { status: AssignmentStatusEnum.CANCELLED },
        );

        await this.appointmentRepository.update(
            {
                serviceRequestId: serviceRequest.getId(),
            },
            { status: AppointmentStatusEnum.CANCELLED },
        );
    }
}
