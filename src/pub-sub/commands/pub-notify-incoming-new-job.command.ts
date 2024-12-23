import { JobDto } from 'dispatching/dto/job.dto';

export class PubNotifyIncomingNewJobCommand {
    constructor(public readonly providerId: string, public readonly job: JobDto) {}
}
