// The transfer status of the payout-batch.
export enum PayoutBatchStatusEnum {
    // The payout batch has been declined by the bank
    FAILED = 'FAILED',

    // The payout-batch file has been uploaded (and submitted to the bank for processing?).
    IN_TRANSIT = 'IN_TRANSIT',

    // The payout has been successfully deposited into the bank.
    PAID = 'PAID',

    // The payout has been partially paid.
    PARTIALLY_PAID = 'PARTIALLY_PAID',

    // The payout-batch has been created and had payouts assigned to it,
    // but it has not yet been submitted to the bank.
    SCHEDULED = 'SCHEDULED',
}
