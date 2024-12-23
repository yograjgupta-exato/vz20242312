/* eslint-disable max-len */
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';
import { ConnectionOptions } from 'typeorm';
import {
    AWSCredentials,
    AppConfig,
    AssetOptions,
    AuthOptions,
    CentrifugoOptions,
    DispatchQueueOptions,
    MetabaseCredentials,
    SmsGatewayFireMobileOptions,
    PaymentGatewayIPay88Options,
    ServiceRequestOptions,
    FeatureToggle,
    PaymentOptions,
    PayoutOptions,
} from '@shared/interfaces';
import { DefaultLogger } from '@shared/logger/default.logger';
import { Logger as AppLogger, LogLevel } from '@shared/logger/logger.interface';
import { SnakeNamingStrategy } from '@shared/typeorm/snake-naming-strategy';
import { isDevMode, environment } from '../../app.environment';
import { ServiceTypeSubscriber } from '../../service-type/service-type.entity';
import { SkillSubscriber } from '../../skill/skill.entity';
import { LanguageCode, Tenant } from '../enums';
import { DefaultConfiguration } from './default-config';

@Injectable()
export class AppConfigService implements AppConfig {
    private activeConfig: AppConfig;
    constructor(private configService: ConfigService) {
        this.activeConfig = Object.assign(DefaultConfiguration, {
            authOptions: {
                jwtSecretKey: this.configService.get('JWT_SECRET_KEY'),
                jwtTokenExpirationTime: configService.get<number>('JWT_TOKEN_EXPIRATION_TIME'),
                jwtRefreshTokenExpirationTime: DefaultConfiguration.authOptions.jwtTokenExpirationTime,
                verificationTokenDuration: DefaultConfiguration.authOptions.verificationTokenDuration,
            },
        } as AppConfig);
    }

    get nodeEnv(): string {
        return environment;
    }

    get appKey(): string {
        return this.activeConfig.appKey;
    }

    get apiBasePath(): string {
        return this.configService.get<string>('API_BASE_PATH') || this.activeConfig.apiBasePath;
    }

    get adminBaseUrl(): string {
        return this.configService.get<string>('ADMIN_BASE_URL');
    }

    get port(): number {
        return this.configService.get<number>('PORT') || this.activeConfig.port;
    }

    get authOptions(): AuthOptions {
        return this.activeConfig.authOptions;
    }

    get cors(): CorsOptions {
        return this.activeConfig.cors;
    }

    get dbConnectionOption(): ConnectionOptions {
        return {
            ...this.activeConfig.dbConnectionOption,
            type: 'postgres',
            host: this.get<string>('DB_HOST'),
            port: this.get<number>('DB_PORT'),
            username: this.get('DB_USERNAME'),
            password: 'nsGjeBWZhxfK9Tzf',
            database: this.get<string>('DB_DATABASE'),
            entities: [path.join(__dirname + '/../../**/*.entity{.ts,.js}')],
            migrations: [path.join(__dirname + '/../../database/migrations/*{.ts,.js}')],
            migrationsRun: isDevMode,
            logging: this.get<string>('DB_LOGGING') === 'true',
            synchronize: this.get<string>('DB_SYNCHRONIZE') === 'true',
            subscribers: [SkillSubscriber, ServiceTypeSubscriber],
            namingStrategy: new SnakeNamingStrategy(),
        };
    }

    get defaultLanguageCode(): LanguageCode {
        return this.activeConfig.defaultLanguageCode;
    }

    get defaultLogLevel(): LogLevel {
        if (process.env.DEFAULT_LOG_LEVEL) {
            return +process.env.DEFAULT_LOG_LEVEL as LogLevel;
        }
        return this.activeConfig.defaultLogLevel;
    }

    get logger(): AppLogger {
        return new DefaultLogger({ level: this.defaultLogLevel });
    }

    get current(): AppConfig {
        return this.activeConfig;
    }

    get awsCredentials(): AWSCredentials {
        return {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION,
        };
    }

    get metabaseCredentials(): MetabaseCredentials {
        return {
            siteUrl: process.env.METABASE_SITE_URL,
            secretKey: process.env.METABASE_SECRET_KEY,
        };
    }

    get assetOptions(): AssetOptions {
        return {
            s3Bucket: process.env.AWS_S3_BUCKET,
            s3BucketPayouts: process.env.AWS_S3_BUCKET_PAYOUTS,
            expiresIn: Number(process.env.AWS_S3_LINK_EXPIRES_IN || 60 * 5),
            cdnUrl: process.env.AWS_S3_CDN_URL,
        };
    }

    get centrifugoOptions(): CentrifugoOptions {
        return {
            apiKey: process.env.CENTRIFUGO_API_KEY,
            apiUrl: process.env.CENTRIFUGO_API_URL,
        };
    }

    get serviceRequestExpectedArrivalWindowHour(): number {
        return this.activeConfig.serviceRequestExpectedArrivalWindowHour;
    }

    get defaultAvatarUrl(): string {
        return this.activeConfig.defaultAvatarUrl;
    }

    get dispatchQueueOptions(): DispatchQueueOptions {
        return {
            name: this.get<string>('DISPATCH_QUEUE_NAME'),
            redisHost: this.get<string>('DISPATCH_QUEUE_REDIS_HOST'),
            redisPort: this.get<number>('DISPATCH_QUEUE_REDIS_PORT'),
            redisClusterMode: this.get<string>('DISPATCH_QUEUE_REDIS_CLUSTER_MODE') === 'true',
        };
    }

    get blockAfterInMinutes(): number {
        return this.activeConfig.blockAfterInMinutes;
    }

    get blockBeforeInMinutes(): number {
        return this.activeConfig.blockBeforeInMinutes;
    }

    get timezoneOffset(): number {
        return +process.env.TIMEZONE_OFFSET || this.activeConfig.timezoneOffset;
    }

    get smsGatewayFireMobileOptions(): SmsGatewayFireMobileOptions {
        return {
            apiUrl: process.env.SMS_GATEWAY_FIRE_MOBILE_API_URL,
            defaultSender: process.env.SMS_GATEWAY_FIRE_MOBILE_DEFAULT_SENDER,
            password: process.env.SMS_GATEWAY_FIRE_MOBILE_PASSWORD,
            userName: process.env.SMS_GATEWAY_FIRE_MOBILE_USERNAME,
        };
    }

    get otpRequestTimeWindowInSeconds(): number {
        return this.get<number>('OTP_REQUEST_TIME_WINDOW_IN_SECONDS');
    }

    get otpExpiryTimeWindowInSeconds(): number {
        return this.get<number>('OTP_EXPIRY_TIME_WINDOW_IN_SECONDS');
    }

    get pushNotificationOptions() {
        return {
            oneSignal: {
                appId: this.get('ONESIGNAL_APP_ID'),
                restApiKey: this.get('ONESIGNAL_REST_API_KEY'),
            },
        };
    }

    paymentGatewayIPay88Options(principalGroup: Tenant): PaymentGatewayIPay88Options {
        switch (principalGroup) {
            case Tenant.Acson:
                return {
                    host: process.env.AMSS_PAYMENT_GATEWAY_IPAY88_HOST,
                    merchantCode: process.env.AMSS_PAYMENT_GATEWAY_IPAY88_MERCHANT_CODE,
                    merchantKey: process.env.AMSS_PAYMENT_GATEWAY_IPAY88_MERCHANT_KEY,
                    backendUrl: process.env.AMSS_PAYMENT_GATEWAY_IPAY88_BACKEND_URL,
                    responseUrl: process.env.AMSS_PAYMENT_GATEWAY_IPAY88_RESPONSE_URL,
                    paymentPath: process.env.AMSS_PAYMENT_GATEWAY_PAYMENT_PATH,
                    deepLinkRedirectUrl: process.env.AMSS_PAYMENT_GATEWAY_IPAY88_APP_DEEP_LINK,
                };
            case Tenant.Daikin:
                return {
                    host: process.env.DMSS_PAYMENT_GATEWAY_IPAY88_HOST,
                    merchantCode: process.env.DMSS_PAYMENT_GATEWAY_IPAY88_MERCHANT_CODE,
                    merchantKey: process.env.DMSS_PAYMENT_GATEWAY_IPAY88_MERCHANT_KEY,
                    backendUrl: process.env.DMSS_PAYMENT_GATEWAY_IPAY88_BACKEND_URL,
                    responseUrl: process.env.DMSS_PAYMENT_GATEWAY_IPAY88_RESPONSE_URL,
                    paymentPath: process.env.DMSS_PAYMENT_GATEWAY_PAYMENT_PATH,
                    deepLinkRedirectUrl: process.env.DMSS_PAYMENT_GATEWAY_IPAY88_APP_DEEP_LINK,
                };
            default:
                throw new Error('todo(roy): Invalid Principal Group');
        }
    }

    tenantOptions(principalGroup: Tenant) {
        switch (principalGroup) {
            case Tenant.Acson:
                return {
                    url: this.get<string>('AMSS_URL'),
                    serviceReportUrl: this.get<string>('AMSS_SERVICE_REPORT_URL'),
                    noReplyEmailAddress: this.get<string>('AMSS_MAILER_DEFAULTS_FROM'),
                    bankAccountNumber: this.get<string>('AMSS_BANK_ACCOUNT_NUMBER'),
                    bankAccountCityCode: this.get<string>('AMSS_BANK_ACCOUNT_CITY_CODE'),
                    bankAccountCountryCode: this.get<string>('AMSS_BANK_ACCOUNT_COUNTRY_CODE'),
                    customerSupportContactNumber: this.get<string>('AMSS_CUSTOMER_SUPPORT_CONTACT_NUMBER'),
                    tokenMessageTemplate: this.get<string>('AMSS_TOKEN_MESSAGE_TEMPLATE'),
                };
            case Tenant.Daikin:
                return {
                    url: this.get<string>('DMSS_URL'),
                    serviceReportUrl: this.get<string>('DMSS_SERVICE_REPORT_URL'),
                    noReplyEmailAddress: this.get<string>('DMSS_MAILER_DEFAULTS_FROM'),
                    bankAccountNumber: this.get<string>('DMSS_BANK_ACCOUNT_NUMBER'),
                    bankAccountCityCode: this.get<string>('DMSS_BANK_ACCOUNT_CITY_CODE'),
                    bankAccountCountryCode: this.get<string>('DMSS_BANK_ACCOUNT_COUNTRY_CODE'),
                    customerSupportContactNumber: this.get<string>('DMSS_CUSTOMER_SUPPORT_CONTACT_NUMBER'),
                    tokenMessageTemplate: this.get<string>('DMSS_TOKEN_MESSAGE_TEMPLATE'),
                };
            default:
                throw new Error('Invalid Principal Group');
        }
    }

    get otpTokenMessageTemplate(): string {
        return this.activeConfig.otpTokenMessageTemplate;
    }

    get crmOptions() {
        return {
            isEnabled: this.get<string>('CRM_ENABLED') === 'true',
            apiServerUrl: this.get<string>('CRM_API_SERVER_URL'),
            apiServiceRequestEndpointPath: this.get<string>('CRM_API_SERVICE_REQUEST_ENDPOINT_PATH'),
            apiCompetitorEqEndpointPath: this.get<string>('CRM_API_COMPETITOR_EQ_ENDPOINT_PATH'),
            apiEquipmentEndpointPath: this.get<string>('CRM_API_SERVICE_REQUEST_ENDPOINT_PATH'),
            username: this.get<string>('CRM_USERNAME'),
            password: this.get<string>('CRM_PASSWORD'),
        };
    }

    get damaServiceReportOptions() {
        return {
            apiServerUrl: this.get<string>('DAMA_SERVICE_REPORT_URL'),
        };
    }

    get mailerTransportOptions() {
        return {
            useSES: this.get<string>('MAILER_USE_SES_TRANSPORT') === 'true',
            host: this.get<string>('MAILER_HOST'),
            requireTLS: this.get<string>('MAILER_REQUIRE_TLS') === 'true',
            port: this.get<string>('MAILER_PORT'),
            auth: {
                user: this.get<string>('MAILER_AUTH_USER'),
                pass: this.get<string>('MAILER_AUTH_PASS'),
            },
            defaults: {
                from: this.get<string>('MAILER_DEFAULTS_FROM'),
            },
        };
    }

    get useRm1ToTestPaymentGateway(): boolean {
        return this.get<string>('USE_RM_1_TO_TEST_PAYMENT_GATEWAY') === 'true';
    }

    get serviceRequestOptions(): ServiceRequestOptions {
        const srOptions = this.activeConfig.serviceRequestOptions;
        return {
            ...srOptions,
            hourLimitBeforeUrgent: +this.get<number>('HOUR_LIMIT_BEFORE_URGENT', srOptions.hourLimitBeforeUrgent),
            hourLimitEcEligibleForRefund: +this.get<number>('HOUR_LIMIT_EC_ELIGIBLE_FOR_REFUND', srOptions.hourLimitEcEligibleForRefund),
            hourLimitBeforeEcRescheduleOptionIsDisabled: +this.get<number>(
                'HOUR_LIMIT_BEFORE_EC_RESCHEDULE_OPTION_IS_DISABLED',
                srOptions.hourLimitBeforeEcRescheduleOptionIsDisabled,
            ),
            hourLimitBeforeEcRescheduleSurchageIsRequired: +this.get<number>(
                'HOUR_LIMIT_BEFORE_EC_RESCHEDULE_SURCHARGE_IS_REQUIRED',
                srOptions.hourLimitBeforeEcRescheduleSurchageIsRequired,
            ),
            hourLimitBeforeEcCancellationOptionIsDisabled: +this.get<number>(
                'HOUR_LIMIT_BEFORE_EC_CANCELLATION_OPTION_IS_DISABLED',
                srOptions.hourLimitBeforeEcCancellationOptionIsDisabled,
            ),
            hourLimitBeforeJobIsAllowedToStart: +this.get<number>(
                'HOUR_LIMIT_BEFORE_JOB_IS_ALLOWED_TO_START',
                srOptions.hourLimitBeforeJobIsAllowedToStart,
            ),
            emergencyCandidateScanningZoneRadiusInKm: +this.get<number>(
                'EMERGENCY_CANDIDATE_SCANNING_ZONE_RADIUS_IN_KM',
                srOptions.emergencyCandidateScanningZoneRadiusInKm,
            ),
            timezoneOffset: +this.get<number>('TIMEZONE_OFFSET', srOptions.timezoneOffset),
            paymentGatewayEnabled: this.get<string>('PAYMENT_GATEWAY_ENABLED', String(srOptions.paymentGatewayEnabled)) === 'true',
            reminderEnabled: this.get<string>('REMINDER_ENABLED', String(srOptions.reminderEnabled)) === 'true',
            remindProviderXSecondsBeforeJobStart: this.get(
                'REMIND_PROVIDER_X_SECONDS_BEFORE_JOB_START',
                srOptions.remindProviderXSecondsBeforeJobStart,
            ),
            ecRescheduleSurchargeAmount: +this.get<number>('EC_RESCHEDULE_SURCHARGE_AMOUNT', srOptions.ecRescheduleSurchargeAmount),
            ecRescheduleCompensationAmount: +this.get<number>('EC_RESCHEDULE_COMPENSATION_AMOUNT', srOptions.ecRescheduleCompensationAmount),
            ecRescheduleMultipleOccurrencesAllowed:
                this.get<string>('EC_RESCHEDULE_MULTIPLE_OCCURRENCES_ALLOWED', String(srOptions.ecRescheduleMultipleOccurrencesAllowed)) === 'true',
        };
    }

    get featureToogles(): FeatureToggle[] {
        return [
            {
                key: 'service_provider_submit_competitor_equipment',
                kind: 'boolean',
                value: this.get<string>('SERVICE_PROVIDER_SUBMIT_COMPETITOR_EQUIPMENT_ENABLED') === 'true',
                enabled: true,
            },
            {
                key: 'service_provider_must_complete_technical_report',
                kind: 'boolean',
                value: true,
                enabled: true,
            },
        ];
    }

    get paymentOptions(): PaymentOptions {
        return {
            processingTimeoutInMinutes:
                +this.get<number>('PAYMENT_OPTIONS_PROCESSING_TIMEOUT_IN_MINUTES') || this.activeConfig.paymentOptions.processingTimeoutInMinutes,
        };
    }

    get payoutOptions(): PayoutOptions {
        const ftp = {
            host: this.get<string>('PAYOUT_OPTIONS_FTP_HOST'),
            username: this.get<string>('PAYOUT_OPTIONS_FTP_USERNAME'),
            password: this.get<string>('PAYOUT_OPTIONS_FTP_PASSWORD'),
            isSecure: this.get<string>('PAYOUT_OPTIONS_FTP_IS_SECURE') === 'true',
        };

        if (ftp.host && ftp.username && ftp.password) {
            return {
                ftp,
                paymentFileUploadPath: this.get<string>('PAYOUT_OPTIONS_PAYMENT_FILE_UPLOAD_PATH'),
                returnFileDownloadPath: this.get<string>('PAYOUT_OPTIONS_RETURN_FILE_DOWNLOAD_PATH'),
                returnFileBackupFilePath: this.get<string>('PAYOUT_OPTIONS_RETURN_FILE_BACKUP_PATH'),
            };
        }

        return null;
    }

    get<T = any>(propertyPath: string, defaultValue?: T): T | undefined {
        return this.configService.get<T>(propertyPath, defaultValue);
    }
}
