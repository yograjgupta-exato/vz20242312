import { Logger } from '@nestjs/common';
import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { AdminPasswordResetEvent } from '../../cqrs/events/password-reset.event';
import { EmailService } from '../email.service';

@EventsHandler(AdminPasswordResetEvent)
export class AdminPasswordResetHandler implements IEventHandler<AdminPasswordResetEvent> {
    constructor(private readonly emailService: EmailService) {}
    private readonly logger = new Logger(AdminPasswordResetHandler.name);

    async handle(event: AdminPasswordResetEvent) {
        this.logger.log(event, 'AdminPasswordResetEvent');
        await this.emailService.sendResetPasswordEmail(event.user.emailAddress, event.passwordResetToken);
    }
}
