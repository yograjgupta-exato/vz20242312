import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PushNotificationType } from '../shared/enums/push-notification-type';
import { PushNotificationService } from './push-notification.service';

@ApiTags('test')
@Controller('test/push-notification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TestPushNotificationController {
    constructor(private readonly service: PushNotificationService) {}

    @Post('test/onesignal-users/:id')
    async testOneSignal(@Param('id') id: string) {
        await this.service.send(PushNotificationType.Job, 'Congrats! You have been assigned to a job. Check the detail now', {}, [id]);
    }

    @Post('test/external-users/:id')
    async testExternal(@Param('id') id: string) {
        const technicianName = 'Chew';
        const principalGroup = 'Daikin';
        const securityCode = '0001';
        /* eslint-disable-next-line max-len */
        const message = `Your technician ${technicianName} from ${principalGroup} is travelling to your place now.\nYour technician security code is ${securityCode}`;
        return this.service.sendToExternalUser(principalGroup, message, id);
    }
}
