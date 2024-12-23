import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from '../../entities/assignment.entity';
import { AssignmentStatusEnum } from '../../enums/assignment-status.enum';
import { ExpireJobAssignmentCommand } from '../expire-job-assignment.command';

@CommandHandler(ExpireJobAssignmentCommand)
export class ExpireJobAssignmentHandler implements ICommandHandler<ExpireJobAssignmentCommand> {
    constructor(@InjectRepository(Assignment) private readonly assignmentRepository: Repository<Assignment>) {}

    async execute(command: ExpireJobAssignmentCommand): Promise<any> {
        const { serviceRequestId } = command;

        await this.assignmentRepository.update(
            {
                serviceRequestId,
                status: AssignmentStatusEnum.PENDING,
            },
            { status: AssignmentStatusEnum.FAILED },
        );
    }
}
