import { OtpType } from '@shared/enums/otp-type';

export class RequestOtpTokenCommand {
    constructor(
        public readonly type: OtpType,
        public readonly phoneNumber: string,
        public readonly checkUserExists: boolean = true,
        public readonly requestCategory: string = null,
    ) {}
}
