import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CentrifugoApi } from './centrifugo.api';
import { CommandHandlers } from './commands/handlers';

@Module({
    imports: [CqrsModule],
    providers: [...CommandHandlers, CentrifugoApi],
})
export class PubSubModule {}
