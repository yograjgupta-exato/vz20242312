export class CancelJobCommand {
    constructor(
        public readonly providerId: string,
        public readonly serviceRequestId: string
    ) { }
}