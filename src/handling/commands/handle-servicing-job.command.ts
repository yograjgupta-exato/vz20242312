import { HandlingEventInput } from 'handling/dto/handling-event.input';

export class HandleServicingJobCommand {
    constructor(public readonly input: HandlingEventInput) {}
}
