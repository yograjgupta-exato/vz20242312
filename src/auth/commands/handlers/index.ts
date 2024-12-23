import { CreateUserLoginCommandHandler, DeleteUserLoginCommandHandler, UpdateUserLoginCommandHandler } from '../../auth.handler';
import { RequestOtpTokenHandler } from './request-otp-token.handler';

// eslint-disable-next-line max-len
export const CommandHandlers = [
    RequestOtpTokenHandler,
    CreateUserLoginCommandHandler,
    CreateUserLoginCommandHandler,
    DeleteUserLoginCommandHandler,
    UpdateUserLoginCommandHandler,
];
