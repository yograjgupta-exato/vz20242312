import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PushNotificationType } from '../../../shared/enums/push-notification-type';
import { PushNotificationService } from '../../push-notification.service';
import { PushNotifyIncomingNewJobCommand } from '../push-notify-incoming-new-job.command';

@CommandHandler(PushNotifyIncomingNewJobCommand)
export class PushNotifyIncomingNewJobHandler implements ICommandHandler<PushNotifyIncomingNewJobCommand> {
    constructor(@Inject(PushNotificationService) private readonly pushNotificationService: PushNotificationService) {}

    async execute(command: PushNotifyIncomingNewJobCommand): Promise<void> {
        const { providerId, job } = command;
        await this.pushNotificationService.send(PushNotificationType.Job, 'You have a new job request', job, [providerId]);
    }
}
