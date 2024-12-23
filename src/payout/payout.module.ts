import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminPayoutController } from './admin-payout.controller';
import { CommandHandlers } from './commands/handlers';
import { PayoutBatch } from './entities/payout-batch.entity';
import { PayoutLine } from './entities/payout-line.entity';
import { Payout } from './entities/payout.entity';
import { PayoutBatchFactory } from './factories/payout-batch.factory';
import { PayoutLineFactory } from './factories/payout-lines.factory';
import { PayoutFactory } from './factories/payout.factory';
import { PayoutController } from './payout.controller';
import { PayoutService } from './payout.service';
import { QueryHandlers } from './queries/handlers';
import { PayoutSaga } from './sagas/payout.saga';
import { FileModule } from 'file/file.module';

@Module({
    controllers: [PayoutController, AdminPayoutController],
    imports: [CqrsModule, FileModule, TypeOrmModule.forFeature([Payout, PayoutBatch, PayoutLine])],
    providers: [PayoutFactory, PayoutBatchFactory, PayoutSaga, PayoutService, PayoutLineFactory, ...QueryHandlers, ...CommandHandlers],
})
export class PayoutModule {}
