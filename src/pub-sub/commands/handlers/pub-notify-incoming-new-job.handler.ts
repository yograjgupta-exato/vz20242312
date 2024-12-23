import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PubNotifyIncomingNewJobCommand } from '../pub-notify-incoming-new-job.command';
import { CentrifugoApi } from 'pub-sub/centrifugo.api';

@CommandHandler(PubNotifyIncomingNewJobCommand)
export class PubNotifyIncomingNewJobHandler implements ICommandHandler<PubNotifyIncomingNewJobCommand> {
    constructor(@Inject(CentrifugoApi) private readonly centrifugoApi: CentrifugoApi) {}

    async execute(command: PubNotifyIncomingNewJobCommand): Promise<void> {
        const { providerId, job } = command;
        await this.centrifugoApi.publish(JSON.stringify(job), `sp/${providerId}/jobs/dispatched`);
    }
}
