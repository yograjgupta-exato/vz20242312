import { Injectable } from '@nestjs/common';
import { PaymentGatewayIPay88Options } from '@shared/interfaces';
import { CreatePaymentRequestParam } from './dtos/create-payment-request.param';
import { BANK_PAYMENT_PATH } from './ipay88.constant';
import { PaymentRequestModel } from './models/payment-request.model';

@Injectable()
export class IPay88Service {
    constructor(private readonly options: PaymentGatewayIPay88Options) {}

    createPaymentRequest(params: CreatePaymentRequestParam) {
        params.webhookUrl = params.webhookUrl ?? this.options.backendUrl;
        params.responseUrl = params.responseUrl ?? this.options.responseUrl;
        params.deepLinkRedirectUrl = params.deepLinkRedirectUrl ?? this.options.deepLinkRedirectUrl;

        return PaymentRequestModel.for(this.options.merchantCode, this.options.merchantKey, params);
    }

    getPaymentUrl() {
        return `${this.options.host}${this.options.paymentPath || BANK_PAYMENT_PATH}`;
    }
}
