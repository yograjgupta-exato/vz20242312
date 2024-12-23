import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config as dotenvConfig } from 'dotenv';
import { PayoutModule } from '@payout/payout.module';
import { PayoutService } from '@payout/payout.service';
import { AppModule } from '../app.module';

dotenvConfig();

const main = async () => {
    Logger.log(`RAN AT ${new Date().toISOString()}`);
    const app = await NestFactory.createApplicationContext(AppModule);
    const payoutService = app.select(PayoutModule).get<PayoutService>(PayoutService);
    await payoutService.processPaymentStatus();
};

main()
    .then(() => {
        Logger.log(`FINISHED AT ${new Date().toISOString()}`);
    })
    .catch(error => {
        Logger.error(error, error.message);
    })
    .finally(() => {
        process.exit(0);
    });
