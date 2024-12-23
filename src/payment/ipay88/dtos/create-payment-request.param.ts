import { PaymentPurposeCode } from '../../../shared/enums/payment-purpose-code';

export interface CreatePaymentRequestParam {
    paymentId?: string;
    referenceId: string;
    amount: string;
    currency: string;
    description: string;
    fullName: string;
    email: string;
    mobile: string;
    remark?: string;
    responseUrl?: string;
    webhookUrl?: string;
    walletToken?: string;
    tokenId?: string;
    deepLinkRedirectUrl?: string;
    paymentPurposeCode: PaymentPurposeCode;
}
