import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { OneSignalModule } from 'onesignal-api-client-nest';
import { AppConfigService } from '@shared/config';
import { CommandHandlers } from './commands/handlers';
import { PushNotificationService } from './push-notification.service';
import { TestPushNotificationController } from './test-push-notification.controller';

@Module({
    controllers: [TestPushNotificationController],
    providers: [...CommandHandlers, PushNotificationService],
    exports: [PushNotificationService],
    imports: [
        CqrsModule,
        OneSignalModule.forRootAsync({
            useFactory: async (configService: AppConfigService) => {
                return configService.pushNotificationOptions.oneSignal;
            },
            inject: [AppConfigService],
        }),
    ],
})
export class PushNotificationModule {}
