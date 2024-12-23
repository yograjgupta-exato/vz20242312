import { ExecutionContext, CanActivate, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { getCustomRepository } from 'typeorm';
import { HEADER_OTP_TOKEN } from '@shared/constants';
import { OtpTokenExpiredError, OtpTokenNotRecognizedError } from '@shared/errors';
import { isDevMode } from '../../app.environment';
import { PhoneVerificationRepository } from '../repository/phone-verification.repository';

@Injectable()
export class OtpTokenGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const otpToken = req.headers[HEADER_OTP_TOKEN];

        if (isDevMode && otpToken === '999999') {
            return true;
        }

        if (!otpToken) {
            throw new OtpTokenNotRecognizedError();
        }

        if (otpToken && Number.isInteger(+otpToken)) {
            const phoneVerificationRepo = getCustomRepository(PhoneVerificationRepository);
            const extantOtpToken = await phoneVerificationRepo.getByOtpToken(otpToken);
            if (!extantOtpToken || !extantOtpToken.isBeforeExpiry(moment.utc().toDate())) {
                throw new OtpTokenExpiredError();
            }
        } else {
            throw new OtpTokenNotRecognizedError();
        }

        return true;
    }
}
