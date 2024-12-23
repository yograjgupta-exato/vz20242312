import { AbstractEvent } from '@cqrs/events/abstract.event';
import { Equipment } from 'equipment/equipment.entity';

export class EquipmentCreatedEvent extends AbstractEvent {
    constructor(public equipment: Equipment) {
        super();
    }
}
