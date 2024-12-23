import { DigitalSignatureType } from '@shared/enums/digital-signature-type';
import { BaseModel } from '@shared/models/base.model';
import { PaymentPurposeCode } from '../../../shared/enums/payment-purpose-code';
import { CreatePaymentRequestParam } from '../dtos/create-payment-request.param';
import { getSignature, stripAmountString } from '../ipay88.helper';
import { IRequestWithSignature } from './interfaces/request-with-signature.interface';

export class PaymentRequestModel extends BaseModel<PaymentRequestModel> implements IRequestWithSignature {
    MerchantCode: string;
    PaymentId: string;
    RefNo: string;
    Amount: string;
    Currency: string;
    ProdDesc: string;
    UserName: string;
    UserEmail: string;
    UserContact: string;
    Remark: string;
    Lang: string;
    SignatureType: string;
    Signature: string;
    ResponseURL: string;
    BackendURL: string;
    Xfield1: PaymentPurposeCode;
    appdeeplink: string;

    private static reset(merchantCode: string): PaymentRequestModel {
        return new PaymentRequestModel({
            MerchantCode: merchantCode,
            PaymentId: '',
            RefNo: '',
            Amount: '',
            Currency: '',
            ProdDesc: '',
            UserName: '',
            UserEmail: '',
            UserContact: '',
            Remark: '',
            Lang: '',
            SignatureType: '',
            Signature: '',
            ResponseURL: '',
            BackendURL: '',
            appdeeplink: '',
            Xfield1: PaymentPurposeCode.FEE,
        });
    }

    public static for(merchantCode: string, merchantKey: string, param: CreatePaymentRequestParam): PaymentRequestModel {
        const request = PaymentRequestModel.reset(merchantCode);
        request.PaymentId = param.paymentId ?? '';
        request.RefNo = param.referenceId;
        request.Amount = param.amount;
        request.Currency = param.currency;
        request.ProdDesc = param.description;
        request.UserName = param.fullName;
        request.UserEmail = param.email;
        request.UserContact = param.mobile;
        request.Remark = param.remark ?? '';
        request.Lang = 'UTF-8';
        request.SignatureType = 'SHA256';
        request.ResponseURL = param.responseUrl ?? '';
        request.BackendURL = param.webhookUrl ?? '';
        request.Xfield1 = param.paymentPurposeCode;
        request.appdeeplink = param.deepLinkRedirectUrl ?? '';
        request.updateSignature(merchantKey);

        return request;
    }

    public updateSignature(merchantKey: string): this {
        this.Signature = getSignature(
            [merchantKey, this.MerchantCode, this.RefNo, stripAmountString(this.Amount), this.Currency, this.Xfield1],
            DigitalSignatureType.SHA256,
        );

        return this;
    }
}
