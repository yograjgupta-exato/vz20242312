import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config as dotenvConfig } from 'dotenv';
import { ServiceRequestModule } from '@service-request/service-request.module';
import { ServiceRequestService } from '@service-request/service-request.service';
import { AppModule } from '../app.module';

dotenvConfig();

const main = async () => {
    const app = await NestFactory.createApplicationContext(AppModule);
    const service = app.select(ServiceRequestModule).get<ServiceRequestService>(ServiceRequestService);
    Logger.log(`Total patched: ${await service.patchPricingDiscrepancyForSelangorState()}`);
    Logger.log(`RAN AT ${new Date().toISOString()}`);
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
