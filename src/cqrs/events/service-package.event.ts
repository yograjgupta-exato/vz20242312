import { ServicePackage } from '../../service-package/entities/service-package.entity';
import { AbstractEvent } from './abstract.event';

export class ServicePackageCreatedEvent extends AbstractEvent {
    constructor(public servicePackage: ServicePackage) {
        super();
    }
}

export class ServicePackageUpdatedEvent extends AbstractEvent {
    constructor(public servicePackage: ServicePackage) {
        super();
    }
}
