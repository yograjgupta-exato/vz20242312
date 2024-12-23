import { UserType } from '@shared/enums';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { ServiceRequest } from '../../service-request/entities/service-request.entity';
import { AbstractEvent } from './abstract.event';

export class ServiceRequestCreatedEvent extends AbstractEvent {
    constructor(public serviceRequest: ServiceRequest) {
        super();
    }
}

export class ServiceRequestReadyForCRMEvent extends AbstractEvent {
    constructor(public serviceRequest: IServiceRequest) {
        super();
    }
}

export class ServiceRequestUpdatedEvent extends AbstractEvent {
    constructor(public serviceRequest: ServiceRequest) {
        super();
    }
}

export class ServiceRequestConfirmedEvent extends AbstractEvent {
    constructor(public serviceRequest: IServiceRequest, public initiateDispatchSequence = true) {
        super();
    }
}

export class ServiceRequestFulfilledEvent extends AbstractEvent {
    constructor(public serviceRequest: IServiceRequest) {
        super();
    }
}

export class ServiceRequestStartedEvent extends AbstractEvent {
    constructor(public serviceRequest: IServiceRequest) {
        super();
    }
}

export class ServiceRequestWorkCommencedEvent extends AbstractEvent {
    constructor(public serviceRequest: IServiceRequest) {
        super();
    }
}

export class ServiceRequestRevokedEvent extends AbstractEvent {
    constructor(public serviceRequest: IServiceRequest, public providerId: string) {
        super();
    }
}
export class ServiceRequestRescheduledEvent extends AbstractEvent {
    constructor(public serviceRequest: IServiceRequest, public impactedServiceProviderId?: string) {
        super();
    }
}

export class ServiceRequestCancelledEvent extends AbstractEvent {
    constructor(public serviceRequest: IServiceRequest, public providerId: string, public workerId: string, public by: UserType) {
        super();
    }
}

export class ServiceRequestFailedEvent extends AbstractEvent {
    constructor(public serviceRequest: IServiceRequest) {
        super();
    }
}

export class ServiceRequestAllocatedEvent extends AbstractEvent {
    constructor(public serviceRequest: IServiceRequest) {
        super();
    }
}

export class ServiceRequestAssignedEvent extends AbstractEvent {
    constructor(public serviceRequest: IServiceRequest) {
        super();
    }
}
