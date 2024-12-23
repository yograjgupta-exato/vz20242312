import { DispatchingServiceRequestFulfilledHandler } from './dispatching-service-request-fulfilled.handler';
import { ServiceRequestAllocatedHandler } from './service-request-allocated.handler';
import { ServiceRequestCancelledHandler } from './service-request-cancelled.handler';
import { ServiceRequestRescheduledHandler } from './service-request-rescheduled.handler';
import { ServiceRequestRevokedHandler } from './service-request-revoked.handler';

export const EventHandlers = [
    ServiceRequestAllocatedHandler,
    ServiceRequestCancelledHandler,
    ServiceRequestRevokedHandler,
    DispatchingServiceRequestFulfilledHandler,
    ServiceRequestRescheduledHandler,
];
