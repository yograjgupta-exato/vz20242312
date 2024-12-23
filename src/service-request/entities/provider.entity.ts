import { Column } from 'typeorm';
import { Agent } from './agent.entity';
import { Schedule } from './schedule.entity';

export class Provider {
    @Column(() => Agent)
    dispatcher: Agent;

    @Column(() => Agent)
    worker: Agent;

    @Column(() => Schedule)
    schedule: Schedule;

    public constructor(dispatcher: Agent, worker: Agent, schedule: Schedule) {
        // refactor: constructor shouldn't do this
        if (dispatcher === undefined || worker === undefined || schedule === undefined) {
            return;
        }
        this.assignToDispatcher(dispatcher);

        if (worker || schedule) {
            this.allocateToWorker(worker, schedule);
        }
    }

    private assignToDispatcher(dispatcher: Agent) {
        this.dispatcher = dispatcher;
        // since its a value object, always good to reset upon construction
        this.worker = null;
        this.schedule = null;
    }

    private allocateToWorker(worker: Agent, schedule: Schedule) {
        if (!this.dispatcher?.id) {
            throw new Error('Please first assign a dispatcher before worker allocation');
        }

        // todo(roy): schedule next;
        if (!worker /*&& !schedule*/) {
            throw new Error('Please allocate a worker and a schedule');
        }

        if (!worker && schedule) {
            throw new Error('Please allocate a worker first');
        }

        // todo(roy): schedule next;
        /*if (worker && !schedule) {
            throw new Error('Please allocate worker with a non-empty schedule');
        }*/

        this.worker = worker;
        this.schedule = schedule;
    }
}
