import { Controller, Post, Req, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentService } from './payment.service';

@ApiTags('webhook')
@Controller('webhooks')
export class WebhookController {
    constructor(private readonly paymentService: PaymentService) {}
    private readonly logger = new Logger(WebhookController.name);

    @Post('payment')
    @HttpCode(HttpStatus.OK)
    async webhooksPayment(@Req() request: Request): Promise<string> {
        this.logger.log(request.body);
        await this.paymentService.iPay88Webhook(request.body);
        return 'RECEIVEOK';
    }
}
