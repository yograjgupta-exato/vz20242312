export class SendCompletionVerificationCodeCommand {
    constructor(
        public readonly verificationCode: string,
        public readonly principalGroupName: string,
        public readonly customerPhoneNumber: string,
    ) {}
}
