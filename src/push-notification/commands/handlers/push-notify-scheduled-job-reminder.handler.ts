import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as moment from 'moment';
import { PushNotificationType } from '../../../shared/enums/push-notification-type';
import { PushNotificationService } from '../../push-notification.service';
import { PushNotifyScheduledJobReminderCommand } from '../push-notify-scheduled-job-reminder.command';

@CommandHandler(PushNotifyScheduledJobReminderCommand)
export class PushNotifyScheduledJobReminderHandler implements ICommandHandler<PushNotifyScheduledJobReminderCommand> {
    constructor(@Inject(PushNotificationService) private readonly pushNotificationService: PushNotificationService) {}

    private readonly logger = new Logger(PushNotifyScheduledJobReminderHandler.name);

    async execute(command: PushNotifyScheduledJobReminderCommand): Promise<void> {
        const { providerId, srDto, countDownTillServiceStartInSeconds } = command;

        const humanizedDuration = moment.duration(countDownTillServiceStartInSeconds, 'seconds').humanize(true);
        // refactor(roy): template to handle next day & near-time reminder text
        const message = `Reminder: Your have a scheduled appointment ${humanizedDuration}. Be sure to check the detail.`;
        delete srDto.customerAddress;
        delete srDto.customerContact;
        delete srDto.customerOrder;
        delete srDto.appointment;
        delete srDto.service;

        this.logger.debug(message);
        await this.pushNotificationService.send(PushNotificationType.Job, message, { serviceRequest: srDto }, [providerId]);
    }
}
