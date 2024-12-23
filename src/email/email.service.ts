import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { isDevMode } from '../app.environment';
import { AppConfigService } from '../shared/config';
@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    constructor(private readonly mailerService: MailerService, private readonly appConfigService: AppConfigService) {}

    async sendResetPasswordEmail(emailAddress: string, token: string) {
        this.logger.log(`Sending reset pasword to ${emailAddress} with token ${token}`);

        if (isDevMode && emailAddress.endsWith('demo.com')) {
            emailAddress = 'cchitsiang@hotmail.com';
        }
        return this.sendWithTemplate(emailAddress, 'admin-password-reset', 'Password Reset', {
            adminUrl: this.appConfigService.adminBaseUrl,
            passwordResetToken: token,
        });
    }

    async sendWithTemplate(to: string, template: string, subject: string, context: any = null, from = process.env.MAILER_DEFAULTS_FROM) {
        this.mailerService
            .sendMail({
                from,
                to,
                subject,
                template,
                context,
            })
            .then(success => {
                this.logger.log(success);
            })
            .catch(err => {
                this.logger.error(err);
            });
    }
}
