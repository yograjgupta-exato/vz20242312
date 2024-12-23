import { CrmServiceRequestFulfilledOrFailedHandler } from './crm-service-request-fulfilled.handler';
import { ServicePackageCreatedHandler } from './service-package-created.handler';
import { ServicePackageUpdatedHandler } from './service-package-updated.handler';
import { ServiceRequestUpdatedHandler } from './service-request-updated.handler';

export const EventHandlers = [
    ServicePackageCreatedHandler,
    ServicePackageUpdatedHandler,
    ServiceRequestUpdatedHandler,
    CrmServiceRequestFulfilledOrFailedHandler,
];
