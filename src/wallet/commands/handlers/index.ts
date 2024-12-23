import { CreateIncomeTransactionHandler } from './create-income-transaction.handler';
import { CreateRescheduleSurchargeCompensationTransactionHandler } from './create-reschedule-surcharge-compensation-transaction.handler';
import { GenerateTestWalletTransactionsHandler } from './generate-test-wallet-transactions.handler';
import { HoldBalanceForPayoutHandler } from './hold-balance-for-payout.handler';
// eslint-disable-next-line max-len
import { RegenMissingWalletTransactionsFromFulfilledServiceRequestsHandler } from './regen-missing-wallet-transactions-from-fulfilled-service-requests.handler';
import { ReleaseBalanceForPayoutHandler } from './release-balance-for-payout.handler';

export const CommandHandlers = [
    CreateIncomeTransactionHandler,
    HoldBalanceForPayoutHandler,
    GenerateTestWalletTransactionsHandler,
    ReleaseBalanceForPayoutHandler,
    RegenMissingWalletTransactionsFromFulfilledServiceRequestsHandler,
    CreateRescheduleSurchargeCompensationTransactionHandler,
];
