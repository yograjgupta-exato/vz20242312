import { Post, Controller, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RequestOtpTokenInput } from './dtos/request-otp-token.input';
import { SmsService } from './sms.service';

@ApiTags('test')
@Controller('sms')
export class SmsController {
    constructor(public service: SmsService) {}

    @ApiBearerAuth()
    @Post('otp')
    async testRequestOtpToken(@Body() input: RequestOtpTokenInput) {
        const result = await this.service.sendOtpToken(input.type, input.otpToken, input.phoneNumber, input.requestCategory);
        return {
            success: result,
        };
    }
}
