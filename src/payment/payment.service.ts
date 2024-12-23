import { Injectable, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { QueryBus, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { getCustomRepository, Repository } from 'typeorm';
import { AppConfigService } from '@shared/config';
import { PaymentGatewayProviderType } from '@shared/enums/payment-gateway-provider-type';
import { PaymentGatewayResponseStatus } from '@shared/enums/payment-gateway-response-status';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { GetServiceRequestQuery } from '@service-request/queries/get-service-request.query';
import { PAYMENT_REF_NO_DELIMITER } from '../shared/constants';
import { PaymentGatewayResponseInput } from './dtos/payment-gateway-response.input';
import { PaymentGatewayResponse } from './entities/payment-gateway-response.entity';
import { PaymentGatewayWebhook } from './entities/payment-gateway-webhook.entity';
import { PaymentGatewayRespondedEvent } from './events/payment-gateway-responded.event';
import { PaymentGatewayResponseRepository } from './repository/payment-gateway-response.repository';

@Injectable()
export class PaymentService {
    constructor(
        private readonly eventBus: EventBus,
        private readonly queryBus: QueryBus,
        @InjectRepository(PaymentGatewayWebhook) private readonly paymentGatewayWebhookRepository: Repository<PaymentGatewayWebhook>,
        private readonly appConfigService: AppConfigService,
    ) {}

    // refactor(roy): factory to parse/handle response from different payment gateway provider
    async iPay88Response(input: PaymentGatewayResponseInput, override = false): Promise<{ statusCode: HttpStatus; url: string }> {
        // refactor(roy): to pipe
        if (input?.RefNo) {
            input.RefNo = input.RefNo.split(PAYMENT_REF_NO_DELIMITER)[0];
        }

        const serviceRequest: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(input?.RefNo));
        if (!serviceRequest) {
            throw new InternalServerErrorException();
        }

        const pr = new PaymentGatewayResponse({
            data: { ...(input as any) },
            errorDescription: input?.ErrDesc,
            provider: PaymentGatewayProviderType.IPAY88,
            referenceId: input?.RefNo,
            responseStatus: input?.Status === '1' ? PaymentGatewayResponseStatus.SUCCEEDED : PaymentGatewayResponseStatus.FAILED,
            transactionId: input?.TransId,
            paymentId: input?.PaymentId,
            principalGroup: serviceRequest?.getPrincipalGroup() ?? null,
            paymentPurposeCode: input.Xfield1,
        });

        const paymentGatewayResponseRepo = getCustomRepository(PaymentGatewayResponseRepository);
        const success = await paymentGatewayResponseRepo.insertIfNotExist(pr, override);
        if (success) {
            this.eventBus.publish(new PaymentGatewayRespondedEvent(pr.referenceId, pr.responseStatus, pr.paymentPurposeCode));
        }

        const tenantOptions = this.appConfigService.tenantOptions(serviceRequest.getPrincipalGroup());
        const status = pr.responseStatus === PaymentGatewayResponseStatus.SUCCEEDED ? 'succeeded' : 'failed';
        if (pr.responseStatus === PaymentGatewayResponseStatus.SUCCEEDED) {
            return {
                statusCode: HttpStatus.MOVED_PERMANENTLY,
                url: `${tenantOptions.url}requests/${serviceRequest.getId()}?status=${status}`,
            };
        }

        const errorDescription = pr.errorDescription || '';
        return {
            statusCode: HttpStatus.MOVED_PERMANENTLY,
            url: `${tenantOptions.url}requests/${serviceRequest.getId()}?status=${status}&reason=${errorDescription}`,
        };
    }

    async iPay88Webhook(payload: any): Promise<void> {
        // refactor(roy): to pipe
        if (payload?.RefNo) {
            payload.RefNo = payload.RefNo.split(PAYMENT_REF_NO_DELIMITER)[0];
        }

        const serviceRequest: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(payload?.RefNo));
        if (!serviceRequest) {
            throw new InternalServerErrorException();
        }

        const pw = new PaymentGatewayWebhook({
            data: payload,
            errorDescription: payload?.ErrDesc,
            provider: PaymentGatewayProviderType.IPAY88,
            referenceId: payload?.RefNo,
            responseStatus: payload?.Status === '1' ? PaymentGatewayResponseStatus.SUCCEEDED : PaymentGatewayResponseStatus.FAILED,
            transactionId: payload?.TransId,
            paymentId: payload?.PaymentId,
            paymentPurposeCode: payload?.Xfield1,
        });

        pw.principalGroup = serviceRequest?.getPrincipalGroup();
        await this.paymentGatewayWebhookRepository.save(pw);
        await this.iPay88Response(payload, true);
    }
}
