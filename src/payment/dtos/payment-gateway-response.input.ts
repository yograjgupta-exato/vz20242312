import { PaymentPurposeCode } from '../../shared/enums/payment-purpose-code';

export class PaymentGatewayResponseInput {
    ErrDesc?: string;
    RefNo?: string;
    Status?: string;
    TransId?: string;
    PaymentId?: string;
    Xfield1: PaymentPurposeCode;
}
