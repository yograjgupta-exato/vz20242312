import { AcceptNewDispatchedJobHandler } from './accept-new-dispatched-job.handler';
import { AllocateJobToWorkerHandler } from './allocate-job-to-worker.handler';
import { CancelJobHandler } from './cancel-job.handler';
import { ExpireJobAssignmentHandler } from './expire-job-assignment.handler';
import { InitiateAutoAssignmentHandler } from './initiate-auto-assignment.handler';
import { ManuallyAssignJobToProviderHandler } from './manually-assign-job-to-provider.handler';
import { RevokeJobHandler } from './revoke-job.handler';

export const CommandHandlers = [
    AcceptNewDispatchedJobHandler,
    AllocateJobToWorkerHandler,
    CancelJobHandler,
    InitiateAutoAssignmentHandler,
    ManuallyAssignJobToProviderHandler,
    RevokeJobHandler,
    ExpireJobAssignmentHandler,
];
