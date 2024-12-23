import { Get, Controller, Post, Param, Redirect, HttpStatus, Logger, Body } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { PaymentPurposeCode } from '../shared/enums/payment-purpose-code';
import { PaymentCheckoutInfoDto } from './dtos/payment-checkout-info.dto';
import { PaymentGatewayResponseInput } from './dtos/payment-gateway-response.input';
import { PaymentService } from './payment.service';
import { GetIPay88PaymentCheckoutInfoQuery } from './queries/get-ipay88-payment-checkout-info.query';

@ApiTags('payment')
@Controller('payments')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService, private readonly queryBus: QueryBus) {}
    private readonly logger = new Logger(PaymentController.name);

    @Get('checkout/service-request/:serviceRequestId')
    async getCheckoutPaymentInfo(@Param('serviceRequestId') serviceRequestId: string): Promise<PaymentCheckoutInfoDto> {
        return this.queryBus.execute(new GetIPay88PaymentCheckoutInfoQuery(serviceRequestId, PaymentPurposeCode.FEE));
    }
    @Get('checkout/ec-reschedule-surcharge/:serviceRequestId')
    async getCheckoutECRescheduleSurchargePaymentInfo(@Param('serviceRequestId') serviceRequestId: string): Promise<PaymentCheckoutInfoDto> {
        return this.queryBus.execute(new GetIPay88PaymentCheckoutInfoQuery(serviceRequestId, PaymentPurposeCode.EC_RESCHEDULE_SURCHARGE));
    }

    @Post('response')
    @Redirect('', HttpStatus.MOVED_PERMANENTLY)
    async response(@Body() input: PaymentGatewayResponseInput) {
        this.logger.log(input);
        return this.paymentService.iPay88Response(input);
    }
}
