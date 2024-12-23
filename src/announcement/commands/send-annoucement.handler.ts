import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PushNotificationService } from '../../push-notification/push-notification.service';
import { PushNotificationType } from '../../shared/enums/push-notification-type';
import { SendAnnouncementCommand } from './send-announcement.command';

@CommandHandler(SendAnnouncementCommand)
export class SendAnnouncementCommandHandler implements ICommandHandler<SendAnnouncementCommand> {
    constructor(@Inject(PushNotificationService) private readonly pushNotificationService: PushNotificationService) {}
    private readonly logger = new Logger(SendAnnouncementCommandHandler.name);
    async execute(command: SendAnnouncementCommand): Promise<any> {
        const { message, input, segments } = command;
        await this.pushNotificationService.sendBySegment(PushNotificationType.Announcement, message, input, segments);
    }
}
