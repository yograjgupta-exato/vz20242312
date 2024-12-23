import { ServiceRequestDto } from '@service-request/dto/service-request.dto';

export class PushNotifyScheduledJobReminderCommand {
    constructor(
        public readonly providerId: string,
        public readonly srDto: ServiceRequestDto,
        public readonly countDownTillServiceStartInSeconds: number,
    ) {}
}
