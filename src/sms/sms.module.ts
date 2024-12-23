import { Module } from '@nestjs/common';
import { CommandHandlers } from './commands/handlers';
import { EventHandlers } from './events/handlers';
import { FireMobileApi } from './fire-mobile.api';
import { SmsController } from './sms.controller';
import { SmsService } from './sms.service';

@Module({
    controllers: [SmsController],
    providers: [...CommandHandlers, FireMobileApi, ...EventHandlers, SmsService],
})
export class SmsModule {}
