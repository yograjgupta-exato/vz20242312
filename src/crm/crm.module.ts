import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CRMApiFactory } from './apis/crm-api.factory';
import { CommandHandlers } from './commands/handlers';
import { CRMController } from './crm.controller';
import { CRMService } from './crm.service';
import { EventHandlers } from './handlers';

@Module({
    imports: [CqrsModule],
    providers: [CRMApiFactory, CRMService, ...CommandHandlers, ...EventHandlers],
    exports: [CRMService],
    controllers: [CRMController],
})
export class CRMModule {}
