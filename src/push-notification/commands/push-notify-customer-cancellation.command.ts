import { ServiceRequestDto } from '@service-request/dto/service-request.dto';

export class PushNotifyCustomerCancellationCommand {
    constructor(public readonly providerId: string, public readonly srDto: ServiceRequestDto) {}
}
