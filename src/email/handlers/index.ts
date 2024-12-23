import { AdminPasswordResetHandler } from './admin-password-reset.handler';
import { EmailServiceRequestFulfilledHandler } from './email-service-request-fulfilled.handler';
import { ServiceRequestConfirmedHandler } from './service-request-confirmed.handler';

export const EventHandlers = [AdminPasswordResetHandler, ServiceRequestConfirmedHandler, EmailServiceRequestFulfilledHandler];
