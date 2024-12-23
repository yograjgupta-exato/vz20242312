// refactor(roy): might want to explore event-sourcing
// instead of overriding state.
//
// event-sourcing: how do we handle cancellation and revocation?
export enum AppointmentStatusEnum {
    ALLOCATED = 'ALLOCATED',
    CANCELLED = 'CANCELLED',
    FULFILLED = 'FULFILLED',
    REPLACED = 'REPLACED', // got replaced by other workers
    REVOKED = 'REVOKED',
    RESCHEDULED = 'RESCHEDULED',
}
