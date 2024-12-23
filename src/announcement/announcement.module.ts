import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OneSignalModule } from 'onesignal-api-client-nest';
import { AppConfigService } from '@shared/config';
import { PushNotificationService } from '../push-notification/push-notification.service';
import { Announcement } from './annoucement.entity';
import { AnnouncementController } from './announcement.controller';
import { AnnouncementService } from './announcement.service';
import { CommandHandlers } from './commands';

@Module({
    controllers: [AnnouncementController],
    providers: [AnnouncementService, PushNotificationService, ...CommandHandlers],
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([Announcement]),
        OneSignalModule.forRootAsync({
            useFactory: async (configService: AppConfigService) => {
                return configService.pushNotificationOptions.oneSignal;
            },
            inject: [AppConfigService],
        }),
    ],
})
export class AnnouncementModule {}
