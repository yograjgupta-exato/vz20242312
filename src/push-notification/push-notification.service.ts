import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { NotificationByDeviceBuilder, NotificationBySegmentBuilder } from 'onesignal-api-client-core';
import { OneSignalService } from 'onesignal-api-client-nest';
import { AppConfigService } from '../shared/config';
import { PushNotificationType } from '../shared/enums/push-notification-type';

@Injectable()
export class PushNotificationService {
    constructor(private readonly oneSignalService: OneSignalService, private readonly configService: AppConfigService) {}

    private readonly logger = new Logger(PushNotificationService.name);

    async sendBySegment(pushNotificationType: PushNotificationType, message: string, data: object = null, toSegments: string[]) {
        const input = new NotificationBySegmentBuilder()
            .setIncludedSegments(toSegments)
            .notification()
            .setContents({ en: message })
            .setAttachments({ data: { ...data, pnType: pushNotificationType } })
            .build();
        this.logger.log(input);
        return this.oneSignalService.createNotification(input);
    }

    async send(pushNotificationType: PushNotificationType, message: string, data: object = null, toUserIds: string[]) {
        const input = new NotificationByDeviceBuilder()
            .setIncludeExternalUserIds(toUserIds)
            .notification()
            .setContents({ en: message })
            .setAttachments({ data: { ...data, pnType: pushNotificationType } })
            .build();

        this.logger.log(input);
        return this.oneSignalService.createNotification(input);
    }

    async sendToExternalUser(title: string, message: string, toUserId: string) {
        //TODO: integrate to customer push notification
        // const options = this.configService.pushNotificationOptions.external;
        // await axios.post(
        //     options.endpoint,
        //     JSON.stringify({
        //         requestData: {
        //             accesskeyid: options.clientId,
        //             secretaccesskey: options.secretKey,
        //             Target: toUserId,
        //             Topic: title,
        //             Body: message,
        //         },
        //     }),
        // );

        return true;
    }
}
