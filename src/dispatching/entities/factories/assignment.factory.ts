import { Injectable } from '@nestjs/common';
import { Assignment } from '../assignment.entity';
import { AssignmentInput } from 'dispatching/dto/assignment.input';
import { AssignmentStatusEnum } from 'dispatching/enums/assignment-status.enum';

@Injectable()
export class AssignmentFactory {
    // refactor(roy): import IServiceRequest and IServiceProvider instead.
    public static create(input: Partial<AssignmentInput>): Assignment {
        // refactor(roy): add constructor on entity
        const assignment = new Assignment();
        assignment.providerId = input.providerId;
        assignment.serviceRequestId = input.serviceRequestId;
        assignment.status = AssignmentStatusEnum.PENDING;
        assignment.changeRequestSeconds(input.requestSeconds);
        return assignment;
    }
}
