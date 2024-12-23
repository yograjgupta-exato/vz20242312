import { Logger } from '@nestjs/common';
import { IEventHandler, EventsHandler, QueryBus } from '@nestjs/cqrs';
import * as moment from 'moment';
import { ServiceRequestConfirmedEvent } from '@cqrs/events/service-request.event';
import { AppConfigService } from '@shared/config';
import { Tenant } from '@shared/enums';
import { GetServiceRequestQuery } from '../../service-request/queries/get-service-request.query';
import { EmailService } from '../email.service';

@EventsHandler(ServiceRequestConfirmedEvent)
export class ServiceRequestConfirmedHandler implements IEventHandler<ServiceRequestConfirmedEvent> {
    constructor(private readonly emailService: EmailService, private readonly configService: AppConfigService, private readonly queryBus: QueryBus) {}
    private readonly logger = new Logger(ServiceRequestConfirmedHandler.name);

    async handle(event: ServiceRequestConfirmedEvent) {
        let { serviceRequest } = event;

        if (!serviceRequest.getCustomerOrder() || !serviceRequest.getCustomerContact()) {
            this.logger.log('customerOrder or customerContact information is missing, re-query service request');
            serviceRequest = await this.queryBus.execute(new GetServiceRequestQuery(serviceRequest.getId()));
        }

        const sr = serviceRequest.toDto();

        this.logger.log(event, 'ServiceRequestConfirmedEvent');

        const localStartDateTime = moment
            .utc(sr.expectedArrivalPeriod.start)
            .clone()
            .utcOffset(sr.expectedArrivalPeriod.timezoneOffset);
        const localEndDateTime = moment
            .utc(sr.expectedArrivalPeriod.end)
            .clone()
            .utcOffset(sr.expectedArrivalPeriod.timezoneOffset);
        const formattedExpectedArrivalDate = localStartDateTime.format('ddd MMM DD YYYY');
        const formattedExpectedArrivalStartTime = localStartDateTime.format('hh:mm A');
        const formattedExpectedArrivalEndTime = localEndDateTime.format('hh:mm A');
        const formattedCreationDate = moment(sr.createdAt)
            .clone()
            .utcOffset(sr.expectedArrivalPeriod.timezoneOffset)
            .format('Do MMM YYYY, hh:mm A');

        const customerOrder = sr.customerOrder;
        const tenantOptions = this.configService.tenantOptions(serviceRequest.getPrincipalGroup());

        await this.emailService.sendWithTemplate(
            sr.customerContact.email,
            `${serviceRequest.getPrincipalGroup().toLowerCase()}-service-request-confirmed`,
            'Your request has been confirmed',
            {
                serviceRequestId: serviceRequest.getId(),
                serviceRequestCreationDate: formattedCreationDate,
                serviceRequestUrl: `${tenantOptions.url}requests/${serviceRequest.getId()}`,
                company: serviceRequest.getPrincipalGroup() === Tenant.Daikin ? 'Daikin' : 'Acson',
                custName: sr.customerContact.name,
                custEmail: sr.customerContact.email,
                custPhone: '+' + sr.customerContact.phone,
                custSecondaryContact: sr.customerContact.secondaryPhone?.length > 0 ? '+' + sr.customerContact.secondaryPhone : '',
                formattedAddress: sr.customerAddress.formattedAddress,
                formattedDate: `${formattedExpectedArrivalDate}`,
                formattedTime: `${formattedExpectedArrivalStartTime} - ${formattedExpectedArrivalEndTime}`,
                servicePackages: customerOrder.servicePackages,
                paymentMethod: sr.paymentMethod,
                subtotal: `RM${customerOrder.consumerSubTotal.toFixed(2)}`,
                discount: `RM${customerOrder.consumerDiscountAmount.toFixed(2)}`,
                ...(customerOrder.consumerPromotionAmount && { promotion: `RM${customerOrder.consumerPromotionAmount.toFixed(2)}` }),
                ...(customerOrder.consumerPromotionCode && { promoCode: customerOrder.consumerPromotionCode }),
                total: `RM${customerOrder.consumerTotal.toFixed(2)}`,
                customerSupportContactNumber: tenantOptions.customerSupportContactNumber,
            },
            tenantOptions.noReplyEmailAddress,
        );
    }
}
