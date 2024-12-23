import { LanguageCode } from '@shared/enums';
import { AppConfig } from '@shared/interfaces';
import { DefaultLogger } from '@shared/logger/default.logger';
import { LogLevel } from '@shared/logger/logger.interface';

export const DefaultConfiguration: AppConfig = {
    appKey: 'SuperSecretKey',
    port: 3000,
    apiBasePath: '/api',
    authOptions: {
        jwtSecretKey: 'SuperSecretKey',
        jwtTokenExpirationTime: '30 days',
        jwtRefreshTokenExpirationTime: '180 days',
        verificationTokenDuration: '7d',
    },
    cors: {
        origin: true,
        credentials: true,
        exposedHeaders: 'x-pagination-page-count,x-pagination-total,x-pagination-page,x-pagination-count',
    },
    dbConnectionOption: {
        type: 'postgres',
    },
    defaultLanguageCode: LanguageCode.En,
    defaultLogLevel: LogLevel.Debug,
    logger: new DefaultLogger(),
    serviceRequestExpectedArrivalWindowHour: 2,
    defaultAvatarUrl: 'https://uberisation-attachments-stg.s3-ap-southeast-1.amazonaws.com/avatars/default_avatar.png',
    blockAfterInMinutes: 0,
    blockBeforeInMinutes: 0,
    otpTokenMessageTemplate: 'Your ServisHub code: ${ otpToken }',
    timezoneOffset: 8,
    serviceRequestOptions: {
        hourLimitBeforeUrgent: 6,
        hourLimitEcEligibleForRefund: 24,
        hourLimitBeforeEcRescheduleOptionIsDisabled: 3,
        hourLimitBeforeEcCancellationOptionIsDisabled: 24,
        hourLimitBeforeEcRescheduleSurchageIsRequired: 12,
        hourLimitBeforeJobIsAllowedToStart: 2,
        emergencyCandidateScanningZoneRadiusInKm: 5,
        timezoneOffset: 8,
        paymentGatewayEnabled: true,
        remindProviderXSecondsBeforeJobStart: 7200,
        ecRescheduleSurchargeAmount: 80,
        ecRescheduleCompensationAmount: 60,
        reminderEnabled: true,
        ecRescheduleMultipleOccurrencesAllowed: false,
    },
    featureToogles: [],
    paymentOptions: {
        processingTimeoutInMinutes: 30,
    },
    payoutOptions: null,
};
