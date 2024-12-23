import { Repository, EntityRepository } from 'typeorm';
import { HandlingEvent } from '../entities/handling-event.entity';
import { HandlingHistory } from '../entities/handling-history.entity';

@EntityRepository(HandlingEvent)
export class HandlingEventRepository extends Repository<HandlingEvent> {

    async lookupHandlingHistoryOfServiceRequest(serviceRequestId: string): Promise<HandlingHistory> {
        const events: HandlingEvent[] = await this.find({ where: { serviceRequestId } });
        return new HandlingHistory(events);
    }
}
