import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceArea } from './entities/service-area.entity';
import { QueryHandlers } from './queries/handlers';
import { ServiceAreaController } from './service-area.controller';
import { ServiceAreaService } from './service-area.service';

@Module({
    controllers: [ServiceAreaController],
    imports: [CqrsModule, TypeOrmModule.forFeature([ServiceArea])],
    providers: [...QueryHandlers, ServiceAreaService],
})
export class ServiceAreaModule { }
