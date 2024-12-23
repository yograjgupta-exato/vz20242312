import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TechnicalNoteDto } from '../../dto/technical-note.dto';
import { ServiceRequestService } from '../../service-request.service';
import { SubmitTechnicalNotesCommand } from '../submit-technical-notes.command';

@CommandHandler(SubmitTechnicalNotesCommand)
export class SubmitTechnicalNotesHandler implements ICommandHandler<SubmitTechnicalNotesCommand> {
    constructor(private readonly service: ServiceRequestService) {}

    execute(command: SubmitTechnicalNotesCommand): Promise<TechnicalNoteDto[]> {
        return this.service.patchTechnicalNotes(command.serviceRequestId, command.servicePackageId, command.technicalNotes);
    }
}
