import { HandlingEvent } from './handling-event.entity';

// the handling history of a service-request's service.
export class HandlingHistory {
    public static readonly EMPTY = new HandlingHistory(new Array<HandlingEvent>());

    public constructor(public readonly events: HandlingEvent[]) {}

    //todo(roy): add method to filter duplicated events.
    public mostRecentlyCompletedEvent(): HandlingEvent {
        const sortedEvents = this.events.slice();
        if (sortedEvents.length < 1) {
            return null;
        }

        sortedEvents.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        return sortedEvents[sortedEvents.length - 1];
    }
}
