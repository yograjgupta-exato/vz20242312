import { ServiceRequestFeedbackSubmittedHandler } from './feedback-submitted.handler';
import { PaymentGatewayRespondedHandler } from './payment-gateway-responded.handler';

export const EventHandlers = [PaymentGatewayRespondedHandler, ServiceRequestFeedbackSubmittedHandler];
