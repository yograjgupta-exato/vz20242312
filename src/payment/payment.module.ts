import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigService } from '@shared/config';
import { Tenant } from '@shared/enums';
import { PaymentGatewayResponse } from './entities/payment-gateway-response.entity';
import { PaymentGatewayWebhook } from './entities/payment-gateway-webhook.entity';
import { DMSS_IPAY88_SERVICE, AMSS_IPAY88_SERVICE } from './ipay88/ipay88.constant';
import { IPay88Service } from './ipay88/ipay88.service';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { QueryHandlers } from './queries/handlers';
import { WebhookController } from './webhook.controller';
@Module({
    controllers: [PaymentController, WebhookController],
    imports: [CqrsModule, TypeOrmModule.forFeature([PaymentGatewayResponse, PaymentGatewayWebhook])],
    providers: [
        {
            provide: DMSS_IPAY88_SERVICE,
            useFactory: async (configService: AppConfigService) => {
                return new IPay88Service(configService.paymentGatewayIPay88Options(Tenant.Daikin));
            },
            inject: [AppConfigService],
        },
        {
            provide: AMSS_IPAY88_SERVICE,
            useFactory: async (configService: AppConfigService) => {
                return new IPay88Service(configService.paymentGatewayIPay88Options(Tenant.Acson));
            },
            inject: [AppConfigService],
        },
        PaymentService,
        ...QueryHandlers,
    ],
})
export class PaymentModule {}
