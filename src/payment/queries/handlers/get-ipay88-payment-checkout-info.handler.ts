import { Inject, Logger } from '@nestjs/common';
import { QueryHandler, IQueryHandler, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '@shared/config';
import { CurrencyCode, Tenant } from '@shared/enums';
import { EntityNotFoundError } from '@shared/errors';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { GetServiceRequestQuery } from '@service-request/queries/get-service-request.query';
import { MoneyDto } from '../../../service-request/dto/money.dto';
import { PAYMENT_REF_NO_DELIMITER } from '../../../shared/constants';
import { PaymentPurposeCode } from '../../../shared/enums/payment-purpose-code';
import { PaymentCheckoutInfoDto } from '../../dtos/payment-checkout-info.dto';
import { DMSS_IPAY88_SERVICE, AMSS_IPAY88_SERVICE } from '../../ipay88/ipay88.constant';
import { IPay88Service } from '../../ipay88/ipay88.service';
import { GetIPay88PaymentCheckoutInfoQuery } from '../get-ipay88-payment-checkout-info.query';

@QueryHandler(GetIPay88PaymentCheckoutInfoQuery)
export class GetIPay88PaymentCheckoutInfoHandler implements IQueryHandler<GetIPay88PaymentCheckoutInfoQuery> {
    constructor(
        @Inject(DMSS_IPAY88_SERVICE) private readonly iPay88ServiceForDMSS: IPay88Service,
        @Inject(AMSS_IPAY88_SERVICE) private readonly iPay88ServiceForAMSS: IPay88Service,
        private readonly appConfig: AppConfigService,
        private readonly queryBus: QueryBus,
    ) {}
    private readonly logger = new Logger(GetIPay88PaymentCheckoutInfoHandler.name);

    async execute(query: GetIPay88PaymentCheckoutInfoQuery): Promise<PaymentCheckoutInfoDto> {
        const { serviceRequestId, paymentPurposeCode } = query;

        const serviceRequest: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(serviceRequestId));
        if (!serviceRequest) {
            throw new EntityNotFoundError('ServiceRequest', serviceRequestId);
        }

        let payment: MoneyDto;
        let paymentDesc: string;
        switch (paymentPurposeCode) {
            case PaymentPurposeCode.FEE:
                payment = serviceRequest.getCustomerInvoiceTotalPrice();
                paymentDesc = 'Air-conditional service';
                break;
            case PaymentPurposeCode.EC_RESCHEDULE_SURCHARGE:
                payment = new MoneyDto(this.appConfig.serviceRequestOptions.ecRescheduleSurchargeAmount, CurrencyCode.Myr);
                paymentDesc = 'End Consumer Reschedule Surcharge';
                break;
            default:
                payment = serviceRequest.getCustomerInvoiceTotalPrice();
                paymentDesc = 'Air-conditional service';
                break;
        }

        const customerContact = serviceRequest.getCustomerContact();
        const checkoutPaymentRequest = this.getIPay88ServiceByPrincipalGroup(serviceRequest.getPrincipalGroup()).createPaymentRequest({
            referenceId: serviceRequestId + (paymentPurposeCode !== PaymentPurposeCode.FEE ? PAYMENT_REF_NO_DELIMITER + paymentPurposeCode : ''),
            amount: this.appConfig.useRm1ToTestPaymentGateway ? '1.00' : payment.amount.toFixed(2),
            fullName: customerContact.name,
            email: customerContact.email,
            mobile: customerContact.phone,
            currency: payment.currency,
            description: paymentDesc,
            paymentPurposeCode,
        });

        this.logger.log(checkoutPaymentRequest);

        const bankPaymentUrl = this.getIPay88ServiceByPrincipalGroup(serviceRequest.getPrincipalGroup()).getPaymentUrl();
        return {
            checkoutUrl: bankPaymentUrl,
            checkoutPayload: checkoutPaymentRequest.toObject(),
        };
    }

    getIPay88ServiceByPrincipalGroup(principalGroup: Tenant) {
        switch (principalGroup) {
            case Tenant.Daikin:
                return this.iPay88ServiceForDMSS;
            case Tenant.Acson:
                return this.iPay88ServiceForAMSS;
            default:
                throw new Error('Invalid Principal Group');
        }
    }
}
