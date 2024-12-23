import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Redis from 'ioredis';
import { AppConfigService } from '@shared/config';
import { PaymentGatewayResponse } from '@payment/entities/payment-gateway-response.entity';
import { RefundModule } from '../refund/refund.module';
import { ServicePackage } from '../service-package/entities/service-package.entity';
import { ServiceProviderModule } from '../service-provider/service-provider.module';
import { AdminServiceRequestController } from './admin-service-request.controller';
import { CommandHandlers } from './commands/handlers';
import { AppointmentFactory } from './entities/factories/appointment.factory';
import { CustomerOrderFactory } from './entities/factories/customer-order.factory';
import { ProviderFactory } from './entities/factories/provider.factory';
import { ServiceRequestFactory } from './entities/factories/service-request.factory';
import { RequestedServicePackage } from './entities/requested-service-package.entity';
import { ServiceRequest } from './entities/service-request.entity';
import { EventHandlers } from './events/handlers';
import { QueryHandlers } from './queries';
import { ReminderProcessor } from './reminder.processor';
import { ServiceRequestSaga } from './sagas/service-request.saga';
import { ServiceRequestController } from './service-request.controller';
import { ServiceRequestService } from './service-request.service';
import { TestServiceRequestController } from './test-service-request.controller';
import { CRMModule } from 'crm/crm.module';

@Module({
    controllers: [AdminServiceRequestController, ServiceRequestController, TestServiceRequestController],
    exports: [ServiceRequestService],
    imports: [
        BullModule.registerQueueAsync({
            name: 'reminder',
            useFactory: (configService: AppConfigService) => ({
                prefix: '{queue}',
                defaultJobOptions: {
                    attempts: 10,
                    removeOnComplete: true,
                    removeOnFail: true,
                },
                createClient: () =>
                    configService.dispatchQueueOptions.redisClusterMode
                        ? new Redis.Cluster(
                              [
                                  {
                                      host: configService.dispatchQueueOptions.redisHost,
                                      port: configService.dispatchQueueOptions.redisPort,
                                  },
                              ],
                              {
                                  enableReadyCheck: true,
                              },
                          )
                        : new Redis(configService.dispatchQueueOptions.redisPort, configService.dispatchQueueOptions.redisHost),
            }),
            inject: [AppConfigService],
        }),
        CRMModule,
        CqrsModule,
        TypeOrmModule.forFeature([PaymentGatewayResponse, ServicePackage, ServiceRequest, RequestedServicePackage]),
        RefundModule,
        ServiceProviderModule,
    ],
    providers: [
        AppointmentFactory,
        CustomerOrderFactory,
        ProviderFactory,
        ReminderProcessor,
        ServiceRequestFactory,
        ServiceRequestSaga,
        ServiceRequestService,
        ...CommandHandlers,
        ...EventHandlers,
        ...QueryHandlers,
    ],
})
export class ServiceRequestModule {}
