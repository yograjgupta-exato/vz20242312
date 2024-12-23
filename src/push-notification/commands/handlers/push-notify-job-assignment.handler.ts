import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PushNotificationType } from '../../../shared/enums/push-notification-type';
import { PushNotificationService } from '../../push-notification.service';
import { PushNotifyJobAssignmentCommand } from '../push-notify-job-assignment.command';

@CommandHandler(PushNotifyJobAssignmentCommand)
export class PushNotifyJobAssignmentHandler implements ICommandHandler<PushNotifyJobAssignmentCommand> {
    constructor(@Inject(PushNotificationService) private readonly pushNotificationService: PushNotificationService) {}

    async execute(command: PushNotifyJobAssignmentCommand): Promise<void> {
        const { providerId, srDto } = command;

        delete srDto.customerAddress;
        delete srDto.customerContact;
        delete srDto.customerOrder;
        delete srDto.appointment;
        delete srDto.service;

        await this.pushNotificationService.send(
            PushNotificationType.Job,
            'Congrats! You have been assigned to a job. Check the detail now',
            { serviceRequest: srDto },
            [providerId],
        );
    }
}
