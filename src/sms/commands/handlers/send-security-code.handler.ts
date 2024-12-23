/* eslint-disable max-len */
import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendSecurityCodeCommand } from '../send-security-code.command';
import { SmsService } from 'sms/sms.service';

@CommandHandler(SendSecurityCodeCommand)
export class SendSecurityCodeHandler implements ICommandHandler<SendSecurityCodeCommand> {
    constructor(private readonly smsService: SmsService) {}
    private readonly logger = new Logger(SendSecurityCodeHandler.name);

    async execute(command: SendSecurityCodeCommand): Promise<void> {
        const { securityCode, technicianName, principalGroupName, customerPhoneNumber } = command;
        const message = `Your technician ${technicianName} from ${principalGroupName} is travelling to your place now.\nYour technician security code is ${securityCode}`;

        this.logger.debug(`sending sms-text: ${message}...`);
        await this.smsService.send(message, customerPhoneNumber);
    }
}
