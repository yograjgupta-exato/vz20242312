import { SendCompletionVerificationCodeHandler } from './send-completion-verification-code.handler';
import { SendSecurityCodeHandler } from './send-security-code.handler';

export const CommandHandlers = [
    SendSecurityCodeHandler,
    SendCompletionVerificationCodeHandler
];
