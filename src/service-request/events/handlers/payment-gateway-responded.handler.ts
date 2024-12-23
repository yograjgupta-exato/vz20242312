import { Inject } from '@nestjs/common';
import { QueryBus, EventBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getCustomRepository } from 'typeorm';
import { ServiceRequestConfirmedEvent, ServiceRequestFailedEvent, ServiceRequestRescheduledEvent } from '@cqrs/events/service-request.event';
import { EntityNotFoundError } from '@shared/errors';
import { ServiceRequest } from '@service-request/entities/service-request.entity';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { PaymentGatewayResponseHistory } from '@payment/entities/payment-gateway-response-history.entity';
import { PaymentGatewayRespondedEvent } from '@payment/events/payment-gateway-responded.event';
import { PaymentGatewayResponseRepository } from '@payment/repository/payment-gateway-response.repository';
import { PaymentGatewayResponseStatus } from '../../../shared/enums/payment-gateway-response-status';
import { PaymentPurposeCode } from '../../../shared/enums/payment-purpose-code';
import { AppointmentFactory } from '../../entities/factories/appointment.factory';
import { GetServiceRequestQuery } from '../../queries/get-service-request.query';

@EventsHandler(PaymentGatewayRespondedEvent)
export class PaymentGatewayRespondedHandler implements IEventHandler<PaymentGatewayRespondedEvent> {
    constructor(
        private readonly eventBus: EventBus,
        private readonly queryBus: QueryBus,
        @Inject(AppointmentFactory) private readonly appointmentFactory: AppointmentFactory,
        @InjectRepository(ServiceRequest) private readonly serviceRequestRepository: Repository<ServiceRequest>,
    ) {}

    async handle(event: PaymentGatewayRespondedEvent): Promise<void> {
        const { referenceId, paymentPurposeCode } = event;
        const serviceRequest: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(referenceId));
        if (!serviceRequest) {
            throw new EntityNotFoundError('ServiceRequest', referenceId);
        }

        const paymentGatewayResponseRepo = getCustomRepository(PaymentGatewayResponseRepository);
        const history: PaymentGatewayResponseHistory = await paymentGatewayResponseRepo.lookupCustomerPaymentGatewayResponseHistoryOfServiceRequest(
            serviceRequest.getId(),
            paymentPurposeCode,
        );

        switch (paymentPurposeCode) {
            case PaymentPurposeCode.FEE:
                await this.handleServiceRequestFeePaymentGatewayResponded(serviceRequest, history);
                break;
            case PaymentPurposeCode.EC_RESCHEDULE_SURCHARGE:
                await this.handleEcRescheduleSurchargePayementGatewayResponded(serviceRequest, history);
                break;
            default:
                break;
        }
    }

    async handleEcRescheduleSurchargePayementGatewayResponded(
        serviceRequest: IServiceRequest,
        history: PaymentGatewayResponseHistory,
    ): Promise<void> {
        if (serviceRequest.hasCustomerPaid(PaymentPurposeCode.EC_RESCHEDULE_SURCHARGE)) {
            return;
        }

        serviceRequest.executeCustomerRescheduleOrder(this.appointmentFactory, history);
        serviceRequest.beforeSave();
        await this.serviceRequestRepository.save(serviceRequest);

        if (serviceRequest.hasBeenRescheduledOnce()) {
            const srWithServicePackages: IServiceRequest = await this.serviceRequestRepository.findOne(serviceRequest.getId());
            this.eventBus.publish(
                new ServiceRequestRescheduledEvent(
                    srWithServicePackages,
                    srWithServicePackages.getCustomerRescheduleOrder().impactedServiceProviderId,
                ),
            );
        }
    }

    async handleServiceRequestFeePaymentGatewayResponded(serviceRequest: IServiceRequest, history: PaymentGatewayResponseHistory): Promise<void> {
        if (serviceRequest.hasCustomerPaid(PaymentPurposeCode.FEE)) {
            return;
        }

        serviceRequest.deriveCustomerPaymentProgress(history);
        serviceRequest.beforeSave();
        await this.serviceRequestRepository.save(serviceRequest);

        // note(roy): refetch service-request obj to overcome serviceRequest.beforeSave() that deletes service-packages.
        serviceRequest = await this.queryBus.execute(new GetServiceRequestQuery(serviceRequest.getId()));
        if (serviceRequest.hasCustomerPaid(PaymentPurposeCode.FEE)) {
            this.eventBus.publish(new ServiceRequestConfirmedEvent(serviceRequest));
        }

        if (serviceRequest.hasBeenCancelled() && history.mostRecentResponse().responseStatus === PaymentGatewayResponseStatus.FAILED) {
            this.eventBus.publish(new ServiceRequestFailedEvent(serviceRequest));
        }
    }
}
