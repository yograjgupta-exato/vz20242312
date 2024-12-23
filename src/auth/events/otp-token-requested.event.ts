import { OtpType } from '@shared/enums/otp-type';

export class OtpTokenRequestedEvent {
    constructor(
        public readonly type: OtpType,
        public readonly phoneNumber: string,
        public readonly otpToken: number,
        public readonly requestCategory: string = null,
    ) {}
}
