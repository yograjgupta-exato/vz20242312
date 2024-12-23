import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent, Connection } from 'typeorm';
import { ServicePackageCreatedEvent, ServicePackageUpdatedEvent } from '@cqrs/events/service-package.event';
import { ServicePackage } from './entities/service-package.entity';

@Injectable()
@EventSubscriber()
export class ServicePackageSubscriber implements EntitySubscriberInterface<ServicePackage> {
    constructor(private readonly eventBus: EventBus, connection: Connection) {
        connection.subscribers.push(this);
    }

    listenTo() {
        return ServicePackage;
    }

    async afterInsert(event: InsertEvent<ServicePackage>) {
        this.eventBus.publish(new ServicePackageCreatedEvent(event.entity));
    }

    async afterUpdate(event: UpdateEvent<ServicePackage>) {
        this.eventBus.publish(new ServicePackageUpdatedEvent(event.entity));
    }
}
