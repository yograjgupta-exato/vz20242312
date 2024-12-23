import { ReportFrequency } from '@shared/enums/report-frequency';

export class GetJobSummaryQuery {
    constructor(public readonly providerId: string, public readonly frequency?: ReportFrequency, public readonly date?: string) {}
}
