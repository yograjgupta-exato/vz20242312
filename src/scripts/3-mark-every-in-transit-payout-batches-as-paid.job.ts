import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config as dotenvConfig } from 'dotenv';
import { PayoutModule } from '@payout/payout.module';
import { PayoutService } from '@payout/payout.service';
import { AppModule } from '../app.module';

dotenvConfig();

const main = async () => {
    const app = await NestFactory.createApplicationContext(AppModule);
    const payoutService = app.select(PayoutModule).get<PayoutService>(PayoutService);
    await payoutService.markEveryInTransitPayoutBatchesAsPaid();
    Logger.log(`RAN AT ${new Date().toISOString()}`);

    const wait = require('util').promisify(setTimeout);
    await wait(1000 * 30);
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
