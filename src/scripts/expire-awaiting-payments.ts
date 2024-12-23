import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config as dotenvConfig } from 'dotenv';
import { AppModule } from '../app.module';
import { ServiceRequestModule } from '../service-request/service-request.module';
import { ServiceRequestService } from '../service-request/service-request.service';

dotenvConfig();

const main = async () => {
    const wait = require('util').promisify(setTimeout);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const app = await NestFactory.createApplicationContext(AppModule);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const serviceRequestService = app.select(ServiceRequestModule).get<ServiceRequestService>(ServiceRequestService);

    const serviceRequests = await serviceRequestService.findTimedOutServiceRequests();
    for (const sr of serviceRequests) {
        await serviceRequestService.expire(sr.id);
        await wait(1000);
    }

    Logger.log(`RAN AT ${new Date().toISOString()}`);

    await wait(1000 * 5);
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
