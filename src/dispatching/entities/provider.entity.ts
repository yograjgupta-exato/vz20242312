import { Column } from 'typeorm';
import { Agent } from './agent.entity';
import { Schedule } from './schedule.entity';

export class Provider {
    @Column(() => Agent)
    dispatcher: Agent;

    @Column(() => Agent)
    worker: Agent;

    // note(roy): The schedule is a full service schedule. (it includes total service minutes)
    @Column(() => Schedule)
    schedule: Schedule;
}
