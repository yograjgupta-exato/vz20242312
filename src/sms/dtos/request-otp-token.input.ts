import { ApiProperty } from '@nestjs/swagger';
import { OtpType } from '@shared/enums/otp-type';

export class RequestOtpTokenInput {
    @ApiProperty({ description: 'OTP type', example: 'CUSTOMER/SP' })
    type: OtpType;

    @ApiProperty({ description: '5 digits otp token', example: 12345 })
    otpToken: number;

    @ApiProperty({ description: 'The phone number of service provider.', example: '60165996794' })
    phoneNumber: string;

    @ApiProperty({ description: 'The request category.', example: 'AMSS/DMSS' })
    requestCategory?: string;
}
