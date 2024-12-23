import { JobDto } from 'dispatching/dto/job.dto';

export class JobDispatchedToProviderEvent {
    constructor(public readonly dispatchingId: string, public readonly job: JobDto, public readonly providerId: string) {}
}
