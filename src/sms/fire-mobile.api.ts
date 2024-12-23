import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';
import { AppConfigService } from '@shared/config';
import { ThirdPartyApiError } from '@shared/errors';

@Injectable()
export class FireMobileApi {
    private readonly logger = new Logger(FireMobileApi.name);
    constructor(private readonly configService: AppConfigService) {}

    async send(
        message: string,
        toPhoneNumber: string,
        fromPhoneNumber = this.configService.smsGatewayFireMobileOptions.defaultSender,
    ): Promise<boolean> {
        const form = new FormData();
        form.append('gw-username', this.configService.smsGatewayFireMobileOptions.userName);
        form.append('gw-password', this.configService.smsGatewayFireMobileOptions.password);
        form.append('gw-from', fromPhoneNumber);
        form.append('gw-to', toPhoneNumber);
        form.append('gw-text', message);

        this.logger.debug(form);

        const resp = await axios.post(this.configService.smsGatewayFireMobileOptions.apiUrl, form, { headers: form.getHeaders() });
        this.logger.log(`StatusCode: ${resp.status}. Response: ${resp.data}`);

        const success = resp?.data?.split('&')[0] === 'status=0';
        if (!success) {
            throw new ThirdPartyApiError('FireMobileApi', resp.data);
        }
        return true;
    }
}
