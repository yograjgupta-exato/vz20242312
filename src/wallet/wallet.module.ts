import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommandHandlers } from './commands/handlers';
import { EarningController } from './earning.controller';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { Wallet } from './entities/wallet.entity';
import { QueryHandlers } from './queries/handlers';

@Module({
    controllers: [EarningController],
    imports: [CqrsModule, TypeOrmModule.forFeature([Wallet, WalletTransaction])],
    providers: [...QueryHandlers, ...CommandHandlers],
})
export class WalletModule {}
