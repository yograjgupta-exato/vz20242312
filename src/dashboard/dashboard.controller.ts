import { Controller, UseGuards, Post, Param } from '@nestjs/common';
import { CustomApiHeaders } from '@shared/decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@UseGuards(JwtAuthGuard)
@CustomApiHeaders()
@Controller('dashboards')
export class DashboardController {
    constructor(private readonly service: DashboardService) {}

    @Post(':id')
    async authorizeDashboardAccess(@Param('id') id: string) {
        // TODO: Access control layer for dashboard.
        const iframeUrl = await this.service.generateIframeUrl(+id);

        return {
            data: {
                iframeUrl,
            },
        };
    }
}
