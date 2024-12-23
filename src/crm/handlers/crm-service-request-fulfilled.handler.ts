import { Logger } from '@nestjs/common';
import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { ServiceRequestFailedEvent, ServiceRequestFulfilledEvent } from '@cqrs/events/service-request.event';
import { ServiceRequestMappingKeys } from '../crm.enum';
import { CRMService } from '../crm.service';

@EventsHandler(ServiceRequestFulfilledEvent, ServiceRequestFailedEvent)
export class CrmServiceRequestFulfilledOrFailedHandler implements IEventHandler<ServiceRequestFulfilledEvent | ServiceRequestFailedEvent> {
    constructor(private readonly crmService: CRMService) {}

    async handle(event: ServiceRequestFulfilledEvent | ServiceRequestFailedEvent) {
        Logger.log(event, 'ServiceRequestUpdatedEvent');
        const entity = event.serviceRequest;
        await this.crmService.closeServiceRequest({
            [ServiceRequestMappingKeys.id]: entity.getId(),
        } as any);
        Logger.log(event, 'ServiceRequestFulfilledEvent');
    }
}
