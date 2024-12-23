export class MarkPayoutLinesAsPaidCommand {
    constructor(public readonly serviceRequestId: string, public readonly serviceProviderVendorId: string) {}
}
