import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { ServiceRequestRevokedEvent } from '@cqrs/events/service-request.event';
import { Assignment } from '../../entities/assignment.entity';
import { AppointmentStatusEnum } from '../../enums/appointment-status.enum';
import { AssignmentStatusEnum } from '../../enums/assignment-status.enum';
import { Appointment } from 'dispatching/entities/appointment.entity';

@EventsHandler(ServiceRequestRevokedEvent)
export class ServiceRequestRevokedHandler implements IEventHandler<ServiceRequestRevokedEvent> {
    constructor(
        @InjectRepository(Assignment) private readonly assignmentRepository: Repository<Assignment>,
        @InjectRepository(Appointment) private readonly allocationRepository: Repository<Appointment>,
    ) {}

    // todo(roy): inaccurate as all of previous appointments will be replaced by 'REVOKED' instead.
    // however low-priority as of now (compared to itemized payout)
    async handle(event: ServiceRequestRevokedEvent) {
        const { serviceRequest } = event;
        await this.assignmentRepository.update(
            {
                serviceRequestId: serviceRequest.getId(),
            },
            { status: AssignmentStatusEnum.REVOKED },
        );
        await this.allocationRepository.update(
            {
                serviceRequestId: serviceRequest.getId(),
            },
            { status: AppointmentStatusEnum.REVOKED },
        );
    }
}
