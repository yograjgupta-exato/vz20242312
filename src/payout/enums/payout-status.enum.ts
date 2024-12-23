// The transfer status of the payout.
export enum PayoutStatusEnum {
    // The payout has been declined by the bank
    FAILED = 'FAILED',

    // The payout has been submitted to the bank for processing
    IN_TRANSIT = 'IN_TRANSIT',

    // The payout has been successfully deposited into the bank.
    PAID = 'PAID',

    // The payout has been created and had transactions assigned to it,
    // but it has not yet been submitted to the bank.
    SCHEDULED = 'SCHEDULED',
}
