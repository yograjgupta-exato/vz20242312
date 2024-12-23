import { EntityNotFoundError } from '@shared/errors';
import { TechnicalNoteDto } from '@service-request/dto/technical-note.dto';
import { TechnicalReport } from './technical-report.entity';

describe('Technical Report', () => {
    describe('# generate', () => {
        it('reports that technical report is `incomplete` at generation', () => {
            const quantity = 10;
            const technicalReport = TechnicalReport.generate(quantity);
            expect(technicalReport.hasBeenCompleted()).toEqual(false);
        });
    });

    describe('# replaceNotes', () => {
        let note1: TechnicalNoteDto, note2: TechnicalNoteDto;
        beforeEach(() => {
            note1 = new TechnicalNoteDto('1');
            note2 = new TechnicalNoteDto('2');
        });

        it('reports technical report is `incomplete` if at least 1 note has empty serial number', () => {
            note1.model = 'model';
            note1.serialNumber = 'serialNumber';

            note2.model = 'model';
            note2.serialNumber = '';

            let technicalReport = TechnicalReport.generate(2);
            technicalReport = technicalReport.replaceNotes([note1, note2]);

            expect(technicalReport.hasBeenCompleted()).toEqual(false);
        });

        it('reports technical report is `incomplete` if at least 1 note has empty model', () => {
            note1.model = 'model';
            note1.serialNumber = 'serialNumber';

            note2.model = '';
            note2.serialNumber = 'serialNumber';

            let technicalReport = TechnicalReport.generate(2);
            technicalReport = technicalReport.replaceNotes([note1, note2]);
            expect(technicalReport.hasBeenCompleted()).toEqual(false);
        });

        it('reports technical report is `completed` as long as all the notes are filled with both serial number & model', () => {
            note1.model = 'model';
            note1.serialNumber = 'serialNumber';

            note2.model = 'model';
            note2.serialNumber = 'serialNumber';

            let technicalReport = TechnicalReport.generate(2);
            technicalReport = technicalReport.replaceNotes([note1, note2]);
            expect(technicalReport.hasBeenCompleted()).toEqual(true);
        });

        it("throws error when at least 1 note id can't be found", () => {
            const nonExistentNote = new TechnicalNoteDto('3');
            let technicalReport = TechnicalReport.generate(2);

            expect(() => {
                technicalReport = technicalReport.replaceNotes([nonExistentNote]);
            }).toThrow(EntityNotFoundError);
        });
    });
});
