export interface IWallet {
    debit(amount: number): void;
    holdBalanceForPayout(amount: number): void;
    releaseBalanceForPayout(amount: number): void;
    getOwnerId(): string;
}
