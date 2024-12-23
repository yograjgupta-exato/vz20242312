import { Inject, Injectable } from '@nestjs/common';
import { template } from 'lodash';
import { AppConfigService } from '@shared/config';
import { OtpType } from '@shared/enums/otp-type';
import { Tenant } from '../shared/enums';
import { FireMobileApi } from './fire-mobile.api';

@Injectable()
export class SmsService {
    constructor(
        @Inject(AppConfigService) private readonly configService: AppConfigService,
        @Inject(FireMobileApi) private readonly fireMobileApi: FireMobileApi,
    ) {}

    async sendOtpToken(type: OtpType, otpToken: number, phoneNumber: string, requestCategory: string = null): Promise<boolean> {
        let compiled;
        if (requestCategory && type === OtpType.Customer) {
            const tenant = requestCategory.toUpperCase() === Tenant.Daikin ? Tenant.Daikin : Tenant.Acson;
            compiled = template(this.configService.tenantOptions(tenant).tokenMessageTemplate);
        } else {
            compiled = template(this.configService.otpTokenMessageTemplate);
        }
        return this.send(compiled({ otpToken }), phoneNumber);
    }

    async send(message: string, phoneNumber: string, prefix = 'RM0 ') {
        return this.fireMobileApi.send(`${prefix}${message}`, phoneNumber);
    }
}
