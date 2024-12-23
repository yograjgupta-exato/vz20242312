import { PaymentGatewayResponseStatus } from '@shared/enums/payment-gateway-response-status';
import { PaymentPurposeCode } from '../../shared/enums/payment-purpose-code';

export class PaymentGatewayRespondedEvent {
    constructor(
        public readonly referenceId: string,
        public readonly responseStatus: PaymentGatewayResponseStatus,
        public readonly paymentPurposeCode: PaymentPurposeCode,
    ) {}
}
