import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminPromotionController } from './admin-promotion.controller';
import { AdminPromotionService } from './admin-promotion.service';
import { CommandHandlers } from './commands';
import { Promotion } from './promotion.entity';

@Module({
    imports: [CqrsModule, TypeOrmModule.forFeature([Promotion])],
    controllers: [AdminPromotionController],
    providers: [...CommandHandlers, AdminPromotionService],
})
export class PromotionModule {}
