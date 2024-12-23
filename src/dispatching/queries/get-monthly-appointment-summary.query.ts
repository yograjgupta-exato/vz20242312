export class GetMonthlyAppointmentSummaryQuery {
    constructor(public readonly providerId: string, public readonly monthOfYear: number) { }
}
