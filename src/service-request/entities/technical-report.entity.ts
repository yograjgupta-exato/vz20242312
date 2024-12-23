import { Column } from 'typeorm';
import { EntityNotFoundError } from '@shared/errors';
import { TechnicalNoteDto } from '@service-request/dto/technical-note.dto';

export class TechnicalReport {
    @Column('simple-json', {
        name: '_notes',
        nullable: true,
    })
    notes?: TechnicalNoteDto[];

    @Column({
        default: false,
        name: '_completed',
    })
    completed: boolean;

    protected constructor(notes: TechnicalNoteDto[]) {
        if (notes === undefined) {
            return;
        }
        this.notes = notes;
        this.completed = this.calculateHasBeenCompleted();
    }

    private calculateHasBeenCompleted(): boolean {
        if (this.notes.length < 1) {
            return false;
        }

        return (
            this.notes.filter(note => {
                return !note.model || !note.serialNumber;
            }).length < 1
        );
    }

    public hasBeenCompleted(): boolean {
        return this.completed;
    }

    public replaceNotes(newNotes: TechnicalNoteDto[]): TechnicalReport {
        for (const newNote of newNotes) {
            const idx = this.notes.findIndex(note => note.id === newNote.id);
            if (idx < 0) {
                throw new EntityNotFoundError('TechnicalNoteDto', newNote.id);
            }

            this.notes[idx] = newNote;
        }

        return new TechnicalReport(this.notes);
    }

    public numOfNotes(): number {
        return this.notes.length;
    }

    public static generate(quantity: number): TechnicalReport {
        const notes = [];
        for (let i = 1; i <= quantity; i++) {
            notes.push(new TechnicalNoteDto(i + ''));
        }

        return new TechnicalReport(notes);
    }
}
