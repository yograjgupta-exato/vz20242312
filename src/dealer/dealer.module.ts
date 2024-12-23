import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceProviderModule } from '../service-provider/service-provider.module';
import { DealerController } from './dealer.controller';
import { Dealer } from './dealer.entity';
import { DealerService } from './dealer.service';

@Module({
    controllers: [DealerController],
    providers: [DealerService],
    imports: [CqrsModule, TypeOrmModule.forFeature([Dealer]), ServiceProviderModule],
})
export class DealerModule {}
