import { Inject, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ServiceRequestStartedEvent } from '@cqrs/events/service-request.event';
import { PushNotificationService } from '../push-notification.service';

@EventsHandler(ServiceRequestStartedEvent)
export class PushNotifyServiceRequestStartedHandler implements IEventHandler<ServiceRequestStartedEvent> {
    private readonly logger = new Logger(PushNotifyServiceRequestStartedHandler.name);

    constructor(@Inject(PushNotificationService) private readonly service: PushNotificationService) {}

    async handle(event: ServiceRequestStartedEvent) {
        const { serviceRequest } = event;
        const sr = serviceRequest.toDto();
        this.logger.log(event, 'ServiceRequestStartedEvent');

        if (sr.externalCustomerId) {
            const technicianName = sr.service.provider.worker.name;
            const principalGroup = sr.principalGroupName;
            const securityCode = sr.securityCode;
            /* eslint-disable-next-line max-len */
            const message = `Your technician ${technicianName} from ${principalGroup} is travelling to your place now.\nYour technician security code is ${securityCode}`;
            await this.service.sendToExternalUser(principalGroup, message, sr.externalCustomerId);
        }
    }
}
