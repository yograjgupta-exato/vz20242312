import { AbstractEvent } from '@cqrs/events/abstract.event';
import { IPayout } from '@payout/interfaces/payout.interface';

export class PayoutScheduledEvent extends AbstractEvent {
    constructor(public payout: IPayout) {
        super();
    }
}

export class PayoutPaidEvent extends AbstractEvent {
    constructor(public payout: IPayout) {
        super();
    }
}
