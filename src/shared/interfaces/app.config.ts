import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConnectionOptions } from 'typeorm';
import { LanguageCode } from '@shared/enums';
import { Logger, LogLevel } from '@shared/logger/logger.interface';

export interface AuthOptions {
    jwtSecretKey: string;
    jwtTokenExpirationTime: string | number;
    jwtRefreshTokenExpirationTime: string | number;
    verificationTokenDuration: string | number;
}

export interface AWSCredentials {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
}

export interface AssetOptions {
    s3Bucket: string;
    s3BucketPayouts: string;
    expiresIn: number;
    cdnUrl: string;
}

export interface CentrifugoOptions {
    apiKey: string;
    apiUrl: string;
}

export interface DispatchQueueOptions {
    name: string;
    redisHost: string;
    redisPort: number;
    redisClusterMode: boolean;
}

export interface SmsGatewayFireMobileOptions {
    apiUrl: string;
    defaultSender: string;
    password: string;
    userName: string;
}

export interface PaymentGatewayIPay88Options {
    host: string;
    merchantCode: string;
    merchantKey: string;
    responseUrl: string;
    backendUrl: string;
    paymentPath?: string;
    deepLinkRedirectUrl?: string;
}

export interface ServiceRequestOptions {
    /**
     * @description
     * The configuration for the hour limit before declaring urgent.
     *
     */
    hourLimitBeforeUrgent: number;

    /**
     * @description
     * The configuration for the hour limit before end-consumer eligible for refund.
     *
     */
    hourLimitEcEligibleForRefund: number;

    /**
     * @description
     * The configuration for the hour limit before blocking/disabling end-consumer reschedule option.
     *
     */
    hourLimitBeforeEcRescheduleOptionIsDisabled: number;

    /**
     * @description
     * The configuration for the hour limit before blocking/disabling end-consumer reschedule option.
     *
     */
    hourLimitBeforeEcRescheduleSurchageIsRequired: number;

    /**
     * @description
     * The configuration for the hour limit before blocking/disabling end-consumer booking cancellation option.
     *
     */
    hourLimitBeforeEcCancellationOptionIsDisabled: number;

    /**
     * @description
     * The configuration for the hour limit before service provider
     * is allowed to start the job.
     *
     */
    hourLimitBeforeJobIsAllowedToStart: number;

    /**
     * @description
     * The radius in km of an emergency scanning zone.
     *
     */
    emergencyCandidateScanningZoneRadiusInKm: number;

    timezoneOffset: number;

    /**
     * @description
     * The feature toggle for payment-gateway.
     *
     */
    paymentGatewayEnabled: boolean;

    reminderEnabled: boolean;

    remindProviderXSecondsBeforeJobStart: number;
    ecRescheduleSurchargeAmount: number;
    ecRescheduleCompensationAmount: number;
    ecRescheduleMultipleOccurrencesAllowed: boolean;
}

export interface PaymentOptions {
    processingTimeoutInMinutes: number;
}

export interface FtpOptions {
    host: string;
    username: string;
    password: string;
    isSecure: boolean;
}

export interface PayoutOptions {
    ftp: FtpOptions;
    paymentFileUploadPath: string;
    returnFileDownloadPath: string;
    returnFileBackupFilePath?: string;
}

export interface FeatureToggle {
    key: string;
    kind: string;
    value: boolean | any;
    enabled: boolean;
}

export interface AppConfig {
    /**
     * @description
     * Is a random string stored in APP_KEY to serve as application encryption key.
     *
     */
    appKey: string;
    /**
     * @description
     * API base path, eg: /api
     */
    apiBasePath?: string;
    /**
     * @description
     * Port that application should listen on.
     *
     * @default 3000
     */
    port: number;
    /**
     * @description
     * Configuration for authorization.
     */
    authOptions: AuthOptions;
    /**
     * @description
     * Set the CORS handling for the server. See the [express CORS docs](https://github.com/expressjs/cors#configuration-options).
     *
     * @default { origin: true, credentials: true }
     */
    cors?: CorsOptions;
    /**
     * @description
     * Provide a logging service which implements the {@link Logger} interface.
     *
     * @default DefaultLogger
     */
    logger?: Logger;
    /**
     * @description
     * The connection options used by TypeORM to connect to the database.
     */
    dbConnectionOption: ConnectionOptions;
    /**
     * @description
     * The default languageCode of the app.
     *
     * @default LanguageCode.En
     */
    defaultLanguageCode?: LanguageCode;

    /**
     * @description
     * The configuration for AWS S3 SDK.
     */
    awsCredentials?: AWSCredentials;

    /**
     * @description
     * The configuration for assets.
     */
    assetOptions?: AssetOptions;

    /**
     * @description
     * The configuration for PubSub Server: Centrifugo.
     */
    centrifugoOptions?: CentrifugoOptions;

    /**
     * @description
     * The configuration for the Service Request.
     */
    serviceRequestExpectedArrivalWindowHour: number;

    /**
     * @description
     * The configuration for the default avatar url.
     */
    defaultAvatarUrl: string;

    /**
     * @description
     * The configuration for the default logging level.
     */
    defaultLogLevel: LogLevel;

    /**
     * @description
     * The configuration for the block after in minutes.
     */
    blockAfterInMinutes: number;

    /**
     * @description
     * The configuration for the block before in minutes.
     */
    blockBeforeInMinutes: number;

    timezoneOffset: number;

    smsGatewayFireMobileOptions?: SmsGatewayFireMobileOptions;

    otpTokenMessageTemplate: string;

    serviceRequestOptions: ServiceRequestOptions;

    featureToogles: FeatureToggle[];

    paymentOptions: PaymentOptions;

    payoutOptions?: PayoutOptions;
}

export interface MetabaseCredentials {
    siteUrl: string;
    secretKey: string;
}
