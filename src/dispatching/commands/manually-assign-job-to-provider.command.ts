export class ManuallyAssignJobToProviderCommand {
    constructor(public readonly providerId: string, public readonly serviceRequestId: string) {}
}
