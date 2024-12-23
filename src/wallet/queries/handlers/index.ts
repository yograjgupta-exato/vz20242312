import { GetDebitableTransactionsForPayoutHandler } from './get-debitable-transactions-for-payout.handler';
import { GetEarningSummaryHandler } from './get-earning-summary-handler';
import { GetPaginatedTransactionsHandler } from './get-paginated-transactions.handler';

export const QueryHandlers = [GetEarningSummaryHandler, GetDebitableTransactionsForPayoutHandler, GetPaginatedTransactionsHandler];
