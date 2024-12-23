/* eslint-disable max-len */
import { HttpStatus } from '@nestjs/common';
import { CoreEntitiesMap } from '@shared/entities';
import { LogLevel } from '@shared/logger/logger.interface';
import { I18nError } from '../i18n/i18n-error';
import { ThirdPartyApisMap } from './constants';

interface IConstraintErrors {
    [constraint: string]: { key: string; message: string };
}

export enum ConstraintCodes {
    DealerReferencedByServiceProvider = 'FK_a92921c485cf4cacf2dfdb54687',
    PromotionCodeUnique = 'UQ_8ab10e580f70c3d2e2e4b31ebf2',
}

export const ConstraintErrors: IConstraintErrors = {
    [ConstraintCodes.DealerReferencedByServiceProvider]: {
        key: 'dealer.referencedBy.serviceProvider',
        message: 'Failed to delete the dealer due to it being referenced by other service provider.',
    },
    [ConstraintCodes.PromotionCodeUnique]: {
        key: 'promotion.unique.code',
        message: 'Duplicate promotion code already exists.',
    },
};

/**
 * @description
 * This error should be thrown when some unexpected and exceptional case is encountered.
 *
 * @docsCategory errors
 * @docsPage Error Types
 */
export class InternalServerError extends I18nError {
    constructor(message = 'SomethingWentWrong', variables: { [key: string]: string | number } = {}) {
        super(message, variables, 'INTERNAL_SERVER_ERROR', LogLevel.Error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

/**
 * @description
 * This error should be thrown when user input is not as expected.
 *
 * @docsCategory errors
 * @docsPage Error Types
 */
export class UserInputError extends I18nError {
    constructor(message: string, variables: { [key: string]: string | number } = {}) {
        super(message, variables, 'USER_INPUT_ERROR', LogLevel.Warn);
    }
}

/**
 * @description
 * This error should be thrown when an operation is attempted which is not allowed.
 *
 * @docsCategory errors
 * @docsPage Error Types
 */
export class IllegalOperationError extends I18nError {
    constructor(message: string, variables: { [key: string]: string | number } = {}) {
        super(message, variables, 'ILLEGAL_OPERATION', LogLevel.Warn, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}

/**
 * @description
 * This error should be thrown when the user's authentication credentials do not match.
 *
 * @docsCategory errors
 * @docsPage Error Types
 */
export class UnauthorizedError extends I18nError {
    constructor() {
        super('Unauthorized', {}, 'UNAUTHORIZED', LogLevel.Info, HttpStatus.UNAUTHORIZED);
    }
}

export class InvalidCredentials extends I18nError {
    constructor() {
        super('InvalidCredentials', {}, 'INVALID_CREDENTIALS', LogLevel.Info, HttpStatus.BAD_REQUEST);
    }
}

/**
 * @description
 * This error should be thrown when a user attempts to access a resource which is outside of
 * his or her privileges.
 *
 * @docsCategory errors
 * @docsPage Error Types
 */
export class ForbiddenError extends I18nError {
    constructor() {
        super('Forbidden', {}, 'FORBIDDEN', LogLevel.Warn, HttpStatus.FORBIDDEN);
    }
}

/**
 * @description
 * This error should be thrown when an entity cannot be found in the database, i.e. no entity of
 * the given entityName (Product, User etc.) exists with the provided id.
 *
 * @docsCategory errors
 * @docsPage Error Types
 */
export class EntityNotFoundError extends I18nError {
    constructor(entityName: keyof typeof CoreEntitiesMap, id: string | number) {
        super('EntityWithIdNotFound', { entityName: entityName.toLowerCase(), id }, 'ENTITY_NOT_FOUND', LogLevel.Warn, HttpStatus.NOT_FOUND);
    }
}

export class ThirdPartyApiError extends I18nError {
    constructor(thirdPartyApiName: keyof typeof ThirdPartyApisMap, message: string) {
        super('ThirdPartyApiFailure', { thirdPartyApiName, message }, 'THIRD_PARTY_API_FAILURE', LogLevel.Warn, HttpStatus.SERVICE_UNAVAILABLE);
    }
}

/**
 * @description
 * This error should be thrown when the verification token (used to verify a Customer's email
 * address) is either invalid or does not match any expected tokens.
 *
 * @docsCategory errors
 * @docsPage Error Types
 */
export class VerificationTokenError extends I18nError {
    constructor() {
        super('VerificationTokenNotRecognized', {}, 'BAD_VERIFICATION_TOKEN', LogLevel.Warn);
    }
}

/**
 * @description
 * This error should be thrown when the verification token (used to verify a Customer's email
 * address) is valid, but has expired according to the `verificationTokenDuration` setting
 * in {@link AuthOptions}.
 *
 * @docsCategory errors
 * @docsPage Error Types
 */
export class VerificationTokenExpiredError extends I18nError {
    constructor() {
        super('VerificationTokenHasExpired', {}, 'EXPIRED_VERIFICATION_TOKEN', LogLevel.Warn);
    }
}

/**
 * @description
 * This error should be thrown when an error occurs trying to reset a Customer's password.
 *
 * @docsCategory errors
 * @docsPage Error Types
 */
export class PasswordResetTokenError extends I18nError {
    constructor() {
        super('PasswordResetTokenNotRecognized', {}, 'BAD_PASSWORD_RESET_TOKEN', LogLevel.Warn);
    }
}

/**
 * @description
 * This error should be thrown when an error occurs trying to reset a Customer's password
 * by reason of the token having expired.
 *
 * @docsCategory errors
 * @docsPage Error Types
 */
export class PasswordResetTokenExpiredError extends I18nError {
    constructor() {
        super('PasswordResetTokenHasExpired', {}, 'EXPIRED_PASSWORD_RESET_TOKEN', LogLevel.Warn);
    }
}

/**
 * @description
 * This error should be thrown when an error occurs trying to verify a phone number
 * by reason of the token having expired.
 *
 * @docsCategory errors
 * @docsPage Error Types
 */
export class OtpTokenExpiredError extends I18nError {
    constructor() {
        super('OtpTokenExpired', {}, 'OTP_TOKEN_EXPIRED', LogLevel.Warn);
    }
}

/**
 * @description
 * This error should be thrown when when the otp token is not associated with any phone number.
 *
 * @docsCategory errors
 * @docsPage Error Types
 */
export class OtpTokenNotRecognizedError extends I18nError {
    constructor() {
        super('OtpTokenNotRecognized', {}, 'OTP_TOKEN_NOT_RECOGNIZED', LogLevel.Warn);
    }
}

/**
 * @description
 * This error should be thrown when when the otp token is being requested too frequently
 * over a period of time.
 *
 * @docsCategory errors
 * @docsPage Error Types
 */
export class TooManyOtpTokenRequestError extends I18nError {
    constructor(expiresInSeconds: number) {
        super('TooManyOtpTokenRequest', { expiresInSeconds }, 'TOO_MANY_OTP_TOKEN_REQUEST', LogLevel.Warn);
    }
}

/**
 * @description
 * This error is thrown when the promo code is not associated with any active Promotion.
 *
 * @docsCategory errors
 * @docsPage Error Types
 */
export class PromotionCodeInvalidError extends I18nError {
    constructor(promoCode: string) {
        super('PromotionCodeInvalid', { promoCode }, 'PROMO_CODE_INVALID', LogLevel.Verbose);
    }
}

/**
 * @description
 * This error is thrown when the coupon code is associated with a Promotion that has expired.
 *
 * @docsCategory errors
 * @docsPage Error Types
 */
export class PromotionCodeExpiredError extends I18nError {
    constructor(promoCode: string) {
        super('PromotionCodeExpired', { promoCode }, 'PROMO_CODE_EXPIRED', LogLevel.Verbose);
    }
}

/**
 * @description
 * This error is thrown when the coupon code is associated with a Promotion that has expired.
 *
 * @docsCategory errors
 * @docsPage Error Types
 */
export class PromotionCodeUsageLimitError extends I18nError {
    constructor(promoCode: string, limit: number) {
        super('PromotionCodeUsageLimit', { promoCode, limit }, 'PROMO_CODE_USAGE_LIMIT_REACHED', LogLevel.Verbose);
    }
}

export class BadRequestError extends I18nError {
    constructor() {
        super('BadRequest', {}, 'BAD_REQUEST', LogLevel.Info, HttpStatus.BAD_REQUEST);
    }
}

/**
 * @description
 * This error should be thrown when the `TechnicalReportNotCompletedError` when service provider
 * attempts to complete job without first filling up technical reports.
 *
 * @docsCategory errors
 * @docsPage Error Types
 */
export class TechnicalReportNotCompletedError extends I18nError {
    constructor() {
        super('TechnicalReportNotCompleted', {}, 'TECHNICAL_REPORT_NOT_COMPLETED', LogLevel.Warn);
    }
}

export class IncorrectVerificationCodeError extends I18nError {
    constructor() {
        super('IncorrectVerificationCode', {}, 'INCORRECT_VERIFICATION_CODE', LogLevel.Warn);
    }
}

/**
 * @description
 * This error should be thrown when the `OutOfServiceCoverageError` when customer
 * attempts to make a booking that is out of service coverage.
 *
 * @docsCategory errors
 * @docsPage Error Types
 */
export class OutOfServiceCoverageError extends I18nError {
    constructor() {
        super('OutOfServiceCoverage', {}, 'OUT_OF_SERVICE_COVERAGE', LogLevel.Info, HttpStatus.BAD_REQUEST);
    }
}

export class LessThanExpectedArrivalWindowHourError extends I18nError {
    constructor(expectedArrivalWindowHour: number) {
        super(
            'LessThanExpectedArrivalWindowHour',
            { expectedArrivalWindowHour },
            'LESS_THAN_EXPECTED_ARRIVAL_WINDOW_HOUR',
            LogLevel.Info,
            HttpStatus.BAD_REQUEST,
        );
    }
}

export class UnableToOpenUnpaidServiceRequestError extends I18nError {
    constructor() {
        super('UnableToOpenUnpaidServiceRequest', {}, 'UNABLE_TO_OPEN_UNPAID_SERVICE_REQUEST', LogLevel.Warn, HttpStatus.FORBIDDEN);
    }
}

export class JobStartTooEarlyError extends I18nError {
    constructor(hourLimit: number) {
        super('JobStartTooEarly', { hourLimit }, 'JOB_START_TOO_EARLY', LogLevel.Warn, HttpStatus.FORBIDDEN);
    }
}

export class EmailAddressAlreadyInUsedError extends I18nError {
    constructor(emailAddress: string) {
        super('EmailAddressAlreadyInUsed', { emailAddress }, 'EMAIL_ADDRESS_ALREADY_IN_USED', LogLevel.Warn, HttpStatus.BAD_REQUEST);
    }
}

export class PrimaryPhoneNumberAlreadyInUsedError extends I18nError {
    constructor(phoneNumber: string) {
        super('PrimaryPhoneNumberAlreadyInUsed', { phoneNumber }, 'PRIMARY_PHONE_NUMBER_ALREADY_IN_USED', LogLevel.Warn, HttpStatus.BAD_REQUEST);
    }
}

export class EquipmentSerialNumberAlreadyRegisteredError extends I18nError {
    constructor(serialNumber: string) {
        super(
            'EquipmentSerialNumberAlreadyRegistered',
            { serialNumber },
            'EQUIPMENT_SERIAL_NUMBER_ALREADY_REGISTERED',
            LogLevel.Warn,
            HttpStatus.BAD_REQUEST,
        );
    }
}

export class ServiceRequestNotAssignedError extends I18nError {
    constructor(serviceRequestId: string) {
        super('ServiceRequestNotAssigned', { serviceRequestId }, 'SERVICE_REQUEST_NOT_ASSIGNED', LogLevel.Warn, HttpStatus.BAD_REQUEST);
    }
}

export class FailToAcceptJobDueToOverlappingAppointmentError extends I18nError {
    constructor(overlappedServiceRequestId: string, overlappedPeriodStart: string, overlappedPeriodEnd: string) {
        super(
            'FailToAcceptJobDueToOverlappingAppointment',
            { overlappedServiceRequestId, overlappedPeriodStart, overlappedPeriodEnd },
            'FAIL_TO_ACCEPT_JOB_DUE_TO_OVERLAPPING_APPOINTMENT',
            LogLevel.Warn,
            HttpStatus.BAD_REQUEST,
        );
    }
}

export class FailToAcceptJobDueToFullyOccupiedWorkersError extends I18nError {
    constructor(jobPeriodStart: string, jobPeriodEnd: string) {
        super(
            'FailToAcceptJobDueToFullyOccupiedWorkers',
            { jobPeriodStart, jobPeriodEnd },
            'FAIL_TO_ACCEPT_JOB_DUE_TO_FULLY_OCCUPIED_WORKERS',
            LogLevel.Warn,
            HttpStatus.BAD_REQUEST,
        );
    }
}

export class FailToManuallyAssignIndependentContractorDueToOverlappingAppointmentError extends I18nError {
    constructor(overlappedServiceRequestId: string, overlappedPeriodStart: string, overlappedPeriodEnd: string) {
        super(
            'FailToManuallyAssignIndependentContractorDueToOverlappingAppointment',
            { overlappedServiceRequestId, overlappedPeriodStart, overlappedPeriodEnd },
            'FAIL_TO_MANUALLY_ASSIGN_INDEPENDENT_CONTRACTOR_DUE_TO_OVERLAPPING_APPOINTMENT',
            LogLevel.Warn,
            HttpStatus.BAD_REQUEST,
        );
    }
}

export class FailToManuallyAssignDealerDueToFullyOccupiedWorkersError extends I18nError {
    constructor(jobPeriodStart: string, jobPeriodEnd: string) {
        super(
            'FailToManuallyAssignDealerDueToFullyOccupiedWorkers',
            { jobPeriodStart, jobPeriodEnd },
            'FAIL_TO_MANUALLY_ASSIGN_DEALER_DUE_TO_FULLY_OCCUPIED_WORKERS',
            LogLevel.Warn,
            HttpStatus.BAD_REQUEST,
        );
    }
}

export class UnableToCancelCompletedJobError extends I18nError {
    constructor() {
        super('UnableToCancelCompletedJob', {}, 'UNABLE_TO_CANCEL_COMPLETED_JOB', LogLevel.Warn, HttpStatus.BAD_REQUEST);
    }
}

export class UnableToCancelTerminatedJobError extends I18nError {
    constructor() {
        super('UnableToCancelTerminatedJob', {}, 'UNABLE_TO_CANCEL_TERMINATED_JOB', LogLevel.Warn, HttpStatus.BAD_REQUEST);
    }
}

export class UnableToRescheduleServiceRequestError extends I18nError {
    constructor() {
        super('UnableToRescheduleServiceRequest', {}, 'UNABLE_TO_RESCHEDULE_SERVICE_REQUEST', LogLevel.Warn, HttpStatus.BAD_REQUEST);
    }
}

export class UnableToCancelServiceRequestDueToWindowPeriodIsPastError extends I18nError {
    constructor() {
        super(
            'UnableToCancelServiceRequestDueToWindowPeriodIsPast',
            {},
            'UNABLE_TO_CANCEL_SERVICE_REQUEST_DUE_TO_WINDOW_PERIOD_IS_PAST',
            LogLevel.Warn,
            HttpStatus.BAD_REQUEST,
        );
    }
}

export class UnableToRescheduleServiceRequestDueToUnpaidSurchargeError extends I18nError {
    constructor() {
        super(
            'UnableToRescheduleServiceRequestDueToUnpaidSurcharge',
            {},
            'UNABLE_TO_RESCHEDULE_SERVICE_REQUEST_DUE_TO_UNPAID_SURCHARGE',
            LogLevel.Warn,
            HttpStatus.BAD_REQUEST,
        );
    }
}

export class UnableToCancelNotPaidServiceRequestError extends I18nError {
    constructor() {
        super('UnableToCancelNotPaidServiceRequestError', {}, 'UNABLE_TO_CANCEL_NOT_PAID_SERVICE_REQUEST', LogLevel.Warn, HttpStatus.BAD_REQUEST);
    }
}

export class UnableToCancelRescheduledServiceRequestError extends I18nError {
    constructor() {
        super('UnableToCancelRescheduledServiceRequest', {}, 'UNABLE_TO_CANCEL_RESCHEDULED_SERVICE_REQUEST', LogLevel.Warn, HttpStatus.BAD_REQUEST);
    }
}

export class TechnicalNoteIsPending extends I18nError {
    constructor() {
        super('TechnicalNoteIsPending', {}, 'TECHNICAL_NOTE_IS_PENDING', LogLevel.Warn, HttpStatus.BAD_REQUEST);
    }
}

export class UnableToCreateServiceReport extends I18nError {
    constructor() {
        super('UnableToCreateServiceReport', {}, 'UNABLE_TO_CREATE_SERVICE_REPORT', LogLevel.Warn, HttpStatus.BAD_REQUEST);
    }
}

export class C4CEquipmentAlreadyWarrantedError extends I18nError {
    constructor() {
        super('C4CEquipmentAlreadyWarranted', {}, 'C4C_EQUIPMENT_ALREADY_WARRANTED', LogLevel.Warn, HttpStatus.BAD_REQUEST);
    }
}
