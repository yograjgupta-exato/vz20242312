export enum WalletTransactionStatusEnum {
    PENDING = 'PENDING', // For transaction_type="PAYOUT", it will be pending until payout returned successful.
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
}
