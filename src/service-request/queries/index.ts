// eslint-disable-next-line max-len
import { FindTerminatedServiceRequestWithMissingWalletTransactionsHandler } from './handlers/find-terminated-service-requests-with-missing-wallet-transactions.handler';
import { GetActiveServiceRequestsOfProviderHandler } from './handlers/get-active-service-requests-of-provider.handler';
import { GetBulkServiceRequestsHandler } from './handlers/get-bulk-service-requests.handler';
import { GetHistoricalServiceRequestsOfProviderHandler } from './handlers/get-historical-service-requests-of-provider.handler';
import { GetJobSummaryHandler } from './handlers/get-job-summary.handler';
import { GetServiceRequestHandler } from './handlers/get-service-request.handler';

export const QueryHandlers = [
    GetActiveServiceRequestsOfProviderHandler,
    GetHistoricalServiceRequestsOfProviderHandler,
    GetJobSummaryHandler,
    GetServiceRequestHandler,
    FindTerminatedServiceRequestWithMissingWalletTransactionsHandler,
    GetBulkServiceRequestsHandler,
];
