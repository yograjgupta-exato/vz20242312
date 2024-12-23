export enum ServiceAllocationStatusEnum {
    // The service has not been assigned to any dispatchers.
    UNASSIGNED = 'OPEN',

    // The service has been allocated to a dispatcher.
    ASSIGNED = 'ACCEPTED',

    // The service has been assigned to a worker by the dispatcher.
    ALLOCATED = 'ALLOCATED',
}
