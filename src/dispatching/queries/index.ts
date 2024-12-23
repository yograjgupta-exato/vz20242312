import { GetAppointmentsByDateHandler } from './handlers/get-appointments-by-date.handler';
import { GetCandidatesHandler } from './handlers/get-candidates.handler';
import { GetJobDetailOfProviderHandler } from './handlers/get-job-detail-of-provider.handler';
import { GetMonthlyAppointmentSummaryHandler } from './handlers/get-monthly-appointment-summary.handler';
import { GetNewDispatchedJobsOfProviderHandler } from './handlers/get-new-dispatched-jobs-of-provider.handler';
import { GetWorkersOfDealerHandler } from './handlers/get-workers-of-dealer.handler';

export const QueryHandlers = [
    GetAppointmentsByDateHandler,
    GetCandidatesHandler,
    GetJobDetailOfProviderHandler,
    GetMonthlyAppointmentSummaryHandler,
    GetNewDispatchedJobsOfProviderHandler,
    GetWorkersOfDealerHandler,
];
