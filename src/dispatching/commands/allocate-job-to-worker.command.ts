export class AllocateJobToWorkerCommand {
    constructor(public readonly dealerId: string, public readonly workerId: string, readonly serviceRequestId: string) { }
}
