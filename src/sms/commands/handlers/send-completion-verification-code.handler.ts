/* eslint-disable max-len */
import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendCompletionVerificationCodeCommand } from '../send-completion-verification-code.command';
import { SmsService } from 'sms/sms.service';


@CommandHandler(SendCompletionVerificationCodeCommand)
export class SendCompletionVerificationCodeHandler implements ICommandHandler<SendCompletionVerificationCodeCommand> {
    constructor(private readonly smsService: SmsService) {}
    private readonly logger = new Logger(SendCompletionVerificationCodeHandler.name);

    async execute(command: SendCompletionVerificationCodeCommand): Promise<void> {
        const { verificationCode, principalGroupName, customerPhoneNumber } = command;

        const message = `Your ${principalGroupName} Verification Code is ${verificationCode}. This code is to verify the job is completed. Please provide the code to Service Provider once the job is completed.`;

        this.logger.debug(`sending sms-text: ${message}...`);
        await this.smsService.send(message, customerPhoneNumber);
    }
}
