export class AcceptNewDispatchedJobCommand {
    constructor(
        public readonly providerId: string,
        public readonly serviceRequestId: string
    ) { }
}