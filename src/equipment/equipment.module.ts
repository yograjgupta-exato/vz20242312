import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquipmentController } from './equipment.controller';
import { Equipment } from './equipment.entity';
import { EquipmentService } from './equipment.service';
import { EquipmentSaga } from './sagas/equipment.saga';

@Module({
    imports: [CqrsModule, TypeOrmModule.forFeature([Equipment])],
    providers: [EquipmentSaga, EquipmentService],
    controllers: [EquipmentController],
})
export class EquipmentModule {}
