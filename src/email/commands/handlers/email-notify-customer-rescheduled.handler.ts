import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as moment from 'moment';
import { AppConfigService } from '@shared/config';
import { EmailService } from '../../email.service';
import { EmailNotifyCustomerRescheduledCommand } from '../email-notify-customer-rescheduled.command';

@CommandHandler(EmailNotifyCustomerRescheduledCommand)
export class EmailNotifyCustomerRescheduledHandler implements ICommandHandler<EmailNotifyCustomerRescheduledCommand> {
    constructor(private readonly emailService: EmailService, private readonly configService: AppConfigService) {}
    private readonly logger = new Logger(EmailNotifyCustomerRescheduledHandler.name);

    async execute(command: EmailNotifyCustomerRescheduledCommand): Promise<void> {
        const { srDto, mockRecipientEmail } = command;
        this.logger.log('ServiceRescheduledEvent');

        const localStartDateTime = moment
            .utc(srDto.expectedArrivalPeriod.start)
            .clone()
            .utcOffset(srDto.expectedArrivalPeriod.timezoneOffset);
        const localEndDateTime = moment
            .utc(srDto.expectedArrivalPeriod.end)
            .clone()
            .utcOffset(srDto.expectedArrivalPeriod.timezoneOffset);

        const formattedExpectedArrivalDate = localStartDateTime.format('ddd MMM DD YYYY');
        const formattedExpectedArrivalStartTime = localStartDateTime.format('hh:mm A');
        const formattedExpectedArrivalEndTime = localEndDateTime.format('hh:mm A');
        const formattedCreationDate = moment(srDto.createdAt)
            .clone()
            .utcOffset(srDto.expectedArrivalPeriod.timezoneOffset)
            .format('Do MMM YYYY, hh:mm A');

        const customerOrder = srDto.customerOrder;
        const tenantOptions = this.configService.tenantOptions(srDto.principalGroup);

        const recipientEmailAddress = mockRecipientEmail ?? srDto.customerContact.email;
        await this.emailService.sendWithTemplate(
            recipientEmailAddress,
            `${srDto.principalGroup.toLowerCase()}-service-request-confirmed`,
            `Your Service ${srDto.id} with ${srDto.principalGroupName} has been rescheduled to ${formattedExpectedArrivalDate}`,
            {
                serviceRequestId: srDto.id,
                serviceRequestCreationDate: formattedCreationDate,
                serviceRequestUrl: `${tenantOptions.url}requests/${srDto.id}`,
                company: srDto.principalGroupName,
                custName: srDto.customerContact.name,
                custEmail: recipientEmailAddress,
                custPhone: '+' + srDto.customerContact.phone,
                custSecondaryContact: srDto.customerContact.secondaryPhone?.length > 0 ? '+' + srDto.customerContact.secondaryPhone : '',
                formattedAddress: srDto.customerAddress.formattedAddress,
                formattedDate: `${formattedExpectedArrivalDate}`,
                formattedTime: `${formattedExpectedArrivalStartTime} - ${formattedExpectedArrivalEndTime}`,
                servicePackages: customerOrder.servicePackages,
                paymentMethod: srDto.paymentMethod,
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
