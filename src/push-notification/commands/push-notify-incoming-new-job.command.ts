import { JobDto } from 'dispatching/dto/job.dto';

export class PushNotifyIncomingNewJobCommand {
    constructor(public readonly providerId: string, public readonly job: JobDto) {}
}
