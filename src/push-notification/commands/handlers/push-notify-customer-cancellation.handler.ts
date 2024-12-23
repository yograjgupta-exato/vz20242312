import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PushNotificationType } from '../../../shared/enums/push-notification-type';
import { PushNotificationService } from '../../push-notification.service';
import { PushNotifyCustomerCancellationCommand } from '../push-notify-customer-cancellation.command';

@CommandHandler(PushNotifyCustomerCancellationCommand)
export class PushNotifyCustomerCancellationHandler implements ICommandHandler<PushNotifyCustomerCancellationCommand> {
    constructor(@Inject(PushNotificationService) private readonly pushNotificationService: PushNotificationService) {}

    async execute(command: PushNotifyCustomerCancellationCommand): Promise<void> {
        const { providerId, srDto } = command;

        delete srDto.customerAddress;
        delete srDto.customerContact;
        delete srDto.customerOrder;
        delete srDto.appointment;
        delete srDto.service;

        await this.pushNotificationService.send(
            PushNotificationType.Job,
            'We are sorry to inform that your customer has cancelled the job',
            { serviceRequest: srDto },
            [providerId],
        );
    }
}
