import { Logger, Injectable } from '@nestjs/common';
import axios from 'axios';
import { AppConfigService } from '@shared/config';

@Injectable()
export class CentrifugoApi {
    private readonly apiKey: string;
    private readonly apiUrl: string;
    private readonly logger = new Logger(CentrifugoApi.name);
    constructor(private readonly configService: AppConfigService) {
        this.apiKey = this.configService.centrifugoOptions.apiKey;
        this.apiUrl = this.configService.centrifugoOptions.apiUrl;
    }

    // refactor(roy): fix the param (use generic type)
    async publish(message: string, channel: string) {
        const payload = {
            method: 'publish',
            params: {
                channel,
                data: JSON.parse(message),
            },
        };

        this.logger.log(`POST to centrifugo: ${this.apiUrl}, ${JSON.stringify(payload)}, key: ${this.apiKey}`);

        let result = null;
        try {
            result = await axios.post(this.apiUrl, payload, {
                headers: { Authorization: `apikey ${this.apiKey}` },
            });
            Logger.log(result.status);
        } catch (ex) {
            this.logger.log(ex);
        }

        return result;
    }

    async broadcast(message: string, channels: string[]) {
        const payload = {
            method: 'publish',
            params: {
                channels,
                data: message,
            },
        };

        this.logger.debug(`broadcasting message: ${message} to ${channels.length} channels...`);
        return axios.post(this.apiUrl, payload, {
            headers: { Authorization: `apikey ${this.apiKey}` },
        });
    }
}
