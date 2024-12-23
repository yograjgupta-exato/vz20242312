import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { getCustomRepository, Repository } from 'typeorm';
import { AppConfigService } from '@shared/config';
import { TooManyOtpTokenRequestError } from '@shared/errors';
import { isDevMode } from '../../../app.environment';
import { RequestOtpTokenCommand } from '../request-otp-token.command';
import { OtpTokenDto } from 'auth/auth.dto';
import { UserLogin } from 'auth/auth.entity';
import { OtpTokenRequestedEvent } from 'auth/events/otp-token-requested.event';
import { PhoneVerification } from 'auth/phone-verification.entity';
import { PhoneVerificationRepository } from 'auth/repository/phone-verification.repository';

@CommandHandler(RequestOtpTokenCommand)
export class RequestOtpTokenHandler implements ICommandHandler<RequestOtpTokenCommand> {
    constructor(
        private readonly eventBus: EventBus,
        @InjectRepository(UserLogin) public userLoginRepository: Repository<UserLogin>,
        @InjectRepository(PhoneVerification) private readonly repository: Repository<PhoneVerification>,
        private readonly appConfig: AppConfigService,
    ) {}

    async execute(command: RequestOtpTokenCommand): Promise<OtpTokenDto> {
        const { phoneNumber } = command;
        if (command.checkUserExists) {
            const userLogin = await this.userLoginRepository.findOne({
                where: { username: phoneNumber },
            });

            if (!userLogin) {
                return;
            }
        }

        const phoneVerificationRepo = getCustomRepository(PhoneVerificationRepository);
        const extantOtpToken = await phoneVerificationRepo.getValidOtpToken(phoneNumber);
        const now = moment.utc().toDate();
        if (extantOtpToken && !extantOtpToken.isWithinRateLimit(now)) {
            throw new TooManyOtpTokenRequestError(extantOtpToken.numberOfSecondsBeforeNextRequest(now));
        }

        const otpToken = this.genOtpToken(100000, 999999);
        const pv = new PhoneVerification({ otpToken, phoneNumber });
        pv.changeExpiryTimeWindow(this.appConfig.otpExpiryTimeWindowInSeconds);
        pv.changeRequestTimeWindow(this.appConfig.otpRequestTimeWindowInSeconds);

        await this.repository.save(pv);
        const dto = new OtpTokenDto();
        dto.success = true;
        if (isDevMode) {
            dto.otpToken = otpToken;
        } else {
            delete dto.otpToken;
        }

        this.eventBus.publish(new OtpTokenRequestedEvent(command.type, phoneNumber, otpToken, command.requestCategory));
        return dto;
    }

    private genOtpToken(min: number, max: number) {
        return Math.floor(Math.random() * (max - min) + min);
    }
}
