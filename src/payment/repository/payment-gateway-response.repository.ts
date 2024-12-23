import { Logger } from '@nestjs/common';
import { Repository, EntityRepository } from 'typeorm';
import { TYPEORM_DUPLICATE_KEY_VALUE_VIOLATES_UNIQUE_CONSTRAINT_ERROR_CODE } from '@shared/constants';
import { PaymentPurposeCode } from '../../shared/enums/payment-purpose-code';
import { PaymentGatewayResponseHistory } from '../entities/payment-gateway-response-history.entity';
import { PaymentGatewayResponse } from '../entities/payment-gateway-response.entity';

@EntityRepository(PaymentGatewayResponse)
export class PaymentGatewayResponseRepository extends Repository<PaymentGatewayResponse> {
    private readonly logger = new Logger(PaymentGatewayResponseRepository.name);

    // todo(roy): complete surcharge + sr payment flow
    async lookupCustomerPaymentGatewayResponseHistoryOfServiceRequest(
        serviceRequestId: string,
        paymentPurposeCode: PaymentPurposeCode,
    ): Promise<PaymentGatewayResponseHistory> {
        const events: PaymentGatewayResponse[] = await this.find({ where: { referenceId: serviceRequestId, paymentPurposeCode } });
        return new PaymentGatewayResponseHistory(events);
    }

    async insertIfNotExist(pr: PaymentGatewayResponse, override = false): Promise<boolean> {
        let success = false;
        try {
            await this.save(pr);
            success = true;
        } catch (err) {
            // note: to capture and dismiss more than 1 incoming payment responses
            // (duplication) from ipay88.
            if (err?.code === TYPEORM_DUPLICATE_KEY_VALUE_VIOLATES_UNIQUE_CONSTRAINT_ERROR_CODE) {
                this.logger.warn(err);

                if (!override) {
                    return success;
                }
                const [paymentResponse] = await this.find({
                    where: {
                        transactionId: pr.transactionId,
                        referenceId: pr.referenceId,
                        principalGroup: pr.principalGroup,
                    },
                });
                if (!paymentResponse) {
                    this.logger.warn('Fail to override existing payment response from', JSON.stringify(pr));
                    return success;
                }

                paymentResponse.paymentId = pr.paymentId;
                paymentResponse.responseStatus = pr.responseStatus;
                paymentResponse.errorDescription = pr.errorDescription;
                paymentResponse.data = pr.data;

                await this.save(paymentResponse);
                success = true;
            } else {
                this.logger.error(err);
            }
        }
        return success;
    }
}
