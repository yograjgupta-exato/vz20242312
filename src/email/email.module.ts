import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AppConfigService } from '../shared/config';
import { CommandHandlers } from './commands/handlers';
import { EmailService } from './email.service';
import { EventHandlers } from './handlers';

@Module({
    providers: [EmailService, ...CommandHandlers, ...EventHandlers],
    exports: [EmailService],
    imports: [
        CqrsModule,
        MailerModule.forRootAsync({
            useFactory: (configService: AppConfigService) => ({
                transport: {
                    host: configService.mailerTransportOptions.host,
                    port: configService.mailerTransportOptions.port,
                    secure: false,
                    requireTLS: configService.mailerTransportOptions.requireTLS,
                    auth: configService.mailerTransportOptions.auth,
                },
                defaults: configService.mailerTransportOptions.defaults,
                template: {
                    dir: __dirname + '/templates/',
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }),
            inject: [AppConfigService],
        }),
    ],
})
export class EmailModule {}
