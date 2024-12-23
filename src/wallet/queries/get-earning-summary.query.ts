import { EarningInput } from 'wallet/dtos/earning.input';

export class GetEarningSummaryQuery {
    constructor(public readonly providerId: string, public readonly input: EarningInput) {}
}
