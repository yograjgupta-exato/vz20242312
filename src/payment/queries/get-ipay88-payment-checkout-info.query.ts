import { PaymentPurposeCode } from '../../shared/enums/payment-purpose-code';

export class GetIPay88PaymentCheckoutInfoQuery {
    constructor(public readonly serviceRequestId: string, public readonly paymentPurposeCode: PaymentPurposeCode) {}
}
