import { ServiceRequestDto } from '@service-request/dto/service-request.dto';

export class PushNotifyCustomerRescheduledCommand {
    constructor(public readonly providerId: string, public readonly srDto: ServiceRequestDto) {}
}
