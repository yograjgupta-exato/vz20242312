import { Logger } from '@nestjs/common';
import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { ServiceRequestUpdatedEvent } from '@cqrs/events/service-request.event';
import { CRMService } from '../crm.service';

@EventsHandler(ServiceRequestUpdatedEvent)
export class ServiceRequestUpdatedHandler implements IEventHandler<ServiceRequestUpdatedEvent> {
    constructor(private readonly crmService: CRMService) {}
    private readonly logger = new Logger(ServiceRequestUpdatedHandler.name);

    handle(event: ServiceRequestUpdatedEvent) {
        this.logger.log(event, 'ServiceRequestUpdatedEvent');
    }
}
