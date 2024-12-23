import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { LoggerModule } from 'nestjs-pino';
import { AppConfigService } from '@shared/config';
import { HttpExceptionFilter } from '@shared/filters/http.exception.filter';
import { SharedModule } from '@shared/shared.module';
import { PayoutModule } from '@payout/payout.module';
import { AdminPermissionModule } from './admin-permission/admin-permission.module';
import { AdminRolesModule } from './admin-role/admin-role.module';
import { AdminUserModule } from './admin-user/admin-user.module';
import { AnnouncementModule } from './announcement/announcement.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CRMModule } from './crm/crm.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DealerModule } from './dealer/dealer.module';
import { EmailModule } from './email/email.module';
import { EquipmentModule } from './equipment/equipment.module';
import { FeedbackModule } from './feedback/feedback.module';
import { FileModule } from './file/file.module';
import { I18nModule } from './i18n/I18n.module';
import { I18nService } from './i18n/i18n.service';
import { PaymentModule } from './payment/payment.module';
import { PromotionModule } from './promotion/promotion.module';
import { PushNotificationModule } from './push-notification/push-notification.module';
import { RefundModule } from './refund/refund.module';
import { ServiceProviderModule } from './service-provider/service-provider.module';
import { ServiceTypeModule } from './service-type/service-type.module';
import { RequestContextMiddleware } from './shared/middlewares/request-context.middleware';
import { SkillModule } from './skill/skill.module';
import { DispatchingModule } from 'dispatching/dispatching.module';
import { HandlingModule } from 'handling/handling.module';
import { PubSubModule } from 'pub-sub/pub-sub.module';
import { ServiceAreaModule } from 'service-area/service-area.module';
import { ServicePackageModule } from 'service-package/service-package.module';
import { ServiceRequestModule } from 'service-request/service-request.module';
import { SmsModule } from 'sms/sms.module';
import { WalletModule } from 'wallet/wallet.module';

@Module({
    imports: [
        SharedModule,
        I18nModule,
        AuthModule,
        AdminUserModule,
        ServiceProviderModule,
        DealerModule,
        TerminusModule,
        AdminPermissionModule,
        EmailModule,
        FileModule,
        SkillModule,
        ServiceTypeModule,
        EquipmentModule,
        ServiceRequestModule,
        HandlingModule,
        ServicePackageModule,
        FeedbackModule,
        DispatchingModule,
        PubSubModule,
        AdminRolesModule,
        DashboardModule,
        SmsModule,
        ServiceAreaModule,
        WalletModule,
        CRMModule,
        PaymentModule,
        PushNotificationModule,
        PayoutModule,
        PromotionModule,
        AnnouncementModule,
        LoggerModule.forRoot(),
        RefundModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
    ],
})
export class AppModule {
    constructor(private configService: AppConfigService, private i18nService: I18nService) {}
    configure(consumer: MiddlewareConsumer) {
        const i18nextHandler = this.i18nService.handle();
        consumer.apply(i18nextHandler).forRoutes({ path: '*', method: RequestMethod.ALL });
        consumer.apply(RequestContextMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
    }
}
