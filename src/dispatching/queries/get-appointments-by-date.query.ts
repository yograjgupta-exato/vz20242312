export class GetAppointmentsByDateQuery {
    constructor(public readonly providerId: string, public readonly date: string) { }
}