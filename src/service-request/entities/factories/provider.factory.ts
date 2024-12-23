import { OptPeriod } from '../../../shared/entities/opt-period.entity';
import { Agent } from '../agent.entity';
import { Provider } from '../provider.entity';
import { Schedule } from '../schedule.entity';

export class ProviderFactory {
    public static createEmptyProvider(): Provider {
        const p = new Provider(null, null, null);

        p.dispatcher = new Agent(null, null, null, null);
        p.worker = new Agent(null, null, null, null);
        p.schedule = new Schedule();
        p.schedule.blockBeforeInMinutes = null;
        p.schedule.blockAfterInMinutes = null;
        p.schedule.period = new OptPeriod();
        p.schedule.period.start = null;
        p.schedule.period.end = null;

        return p;
    }

    // refactor(roy): can consider builder's pattern
    public static create(dispatcher: Agent, worker: Agent, schedule: Schedule): Provider {
        return new Provider(dispatcher, worker, schedule);
    }
}
