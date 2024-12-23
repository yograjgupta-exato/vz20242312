import { TechnicalNoteDto } from '../dto/technical-note.dto';

export class SubmitTechnicalNotesCommand {
    constructor(
        public readonly serviceRequestId: string,
        public readonly servicePackageId: string,
        public readonly technicalNotes: TechnicalNoteDto[],
    ) {}
}
