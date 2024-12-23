import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRequest } from '@service-request/entities/service-request.entity';
import { CommandHandlers } from './commands';
import { HandlingEvent } from './entities/handling-event.entity';
import { HandlingEventFactory } from './entities/handling-event.factory';
import { HandlingController } from './handling.controller';
import { HandlingService } from './handling.service';
import { QueryHandlers } from './queries/handlers';
@Module({
    controllers: [HandlingController],
    providers: [...CommandHandlers, HandlingService, HandlingEventFactory, ...QueryHandlers],
    imports: [CqrsModule, TypeOrmModule.forFeature([HandlingEvent]), TypeOrmModule.forFeature([ServiceRequest])],
    exports: [HandlingService],
})
export class HandlingModule {}
