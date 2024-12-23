export class GetWorkersOfDealerQuery {
    constructor(public readonly dealerId: string, public readonly serviceRequestId: string) { }
}
