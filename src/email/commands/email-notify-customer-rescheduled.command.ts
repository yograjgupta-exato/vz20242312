import { ServiceRequestDto } from '@service-request/dto/service-request.dto';

export class EmailNotifyCustomerRescheduledCommand {
    constructor(public readonly srDto: ServiceRequestDto, public readonly mockRecipientEmail?: string) {}
}
