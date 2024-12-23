import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PushNotificationType } from '../../../shared/enums/push-notification-type';
import { PushNotificationService } from '../../push-notification.service';
import { PushNotifyCustomerRescheduledCommand } from '../push-notify-customer-rescheduled.command';

@CommandHandler(PushNotifyCustomerRescheduledCommand)
export class PushNotifyCustomerRescheduledHandler implements ICommandHandler<PushNotifyCustomerRescheduledCommand> {
    constructor(@Inject(PushNotificationService) private readonly pushNotificationService: PushNotificationService) {}

    async execute(command: PushNotifyCustomerRescheduledCommand): Promise<void> {
        const { providerId, srDto } = command;
        if (!providerId) {
            return;
        }

        await this.pushNotificationService.send(
            PushNotificationType.Job,
            `Service Ticket '${srDto.id}' has been removed from your schedule due to End Consumer had rescheduled the job`,
            { serviceRequest: srDto },
            [providerId],
        );
    }
}
