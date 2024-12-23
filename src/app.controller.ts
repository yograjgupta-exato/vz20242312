import { Controller, Get, Logger } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, DNSHealthIndicator } from '@nestjs/terminus';
import { CustomApiHeaders } from '@shared/decorators';
import { AppService } from './app.service';
import { AppConfigService } from './shared/config';

@Controller()
@CustomApiHeaders()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly health: HealthCheckService,
        private readonly dns: DNSHealthIndicator,
        private readonly configService: AppConfigService,
    ) {}

    @Get()
    getCurrentConfig(): string {
        Logger.log(this.appService.getCurrentConfig());
        return 'OK';
    }

    @Get('health')
    @HealthCheck()
    healthCheck() {
        return this.health.check([async () => this.dns.pingCheck('google', 'https://google.com')]);
    }

    @ApiBearerAuth()
    @Get('configuration')
    async configuration() {
        return {
            features: this.configService.featureToogles,
        };
    }
}
