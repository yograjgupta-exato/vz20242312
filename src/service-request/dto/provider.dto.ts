import { Schedule } from '@service-request/entities/schedule.entity';
import { AgentDto } from './agent.dto';

export class ProviderDto {
    dispatcher: AgentDto;
    worker: AgentDto;
    schedule: Schedule;
}
