export class RevokeJobCommand {
    constructor(public readonly serviceRequestId: string, public readonly markAsFailed: boolean = false) {}
}
