export enum ServiceStatusEnum {
    AWAITING_PAYMENT = 'AWAITING_PAYMENT',
    FAILED_PAYMENT = 'PAYMENT_FAILED',

    // The service has not been assigned to any dispatchers.
    UNASSIGNED = 'OPEN',

    // The service has been allocated to a dispatcher.
    ASSIGNED = 'ACCEPTED',

    // The service has been assigned to a worker by the dispatcher.
    ALLOCATED = 'ALLOCATED',

    // The service has not started. (no longer using)
    // NOT_STARTED = 'NOT_STARTED',

    // The service has been started and the worker is on the way.
    STARTED = 'TRAVELING',

    // The service is currently being performed by the worker.
    IN_PROGRESS = 'JOB_STARTED',

    // The service has been fulfilled successfully. note: other options: `completed`
    FULFILLED = 'JOB_COMPLETED',

    // The service has been fulfilled unsuccessfully.
    FAILED = 'FAILED',

    // The service has been cancelled by the service provider which is assigned to him.
    CANCELLED_BY_SERVICE_PROVIDER = 'CANCELLED_BY_SERVICE_PROVIDER',
    CANCELLED_BY_OPERATOR = 'CANCELLED_BY_OPERATOR',
    CANCELLED_BY_CUSTOMER = 'CANCELLED_BY_CUSTOMER',

    // and other possible status...
}
