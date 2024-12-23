import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { AppConfigService } from '@shared/config';

@Injectable()
export class DashboardService {
    constructor(private readonly configService: AppConfigService) {}

    async generateIframeUrl(id: number) {
        const { siteUrl, secretKey } = this.configService.metabaseCredentials;
        const payload = {
            resource: { dashboard: id },
            params: {},
            exp: Math.round(Date.now() / 1000) + 10 * 60, // 10 minute expiration
        };
        const token = jwt.sign(payload, secretKey);
        const iframeUrl = `${siteUrl}/embed/dashboard/${token}#bordered=true&titled=false`;
        return iframeUrl;
    }
}
