import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentGatewayResponseDto } from '@payment/dtos/payment-gateway-response.dto';
import { HandlingEventDto } from './handling-event.dto';
import { NextServiceActionTypeDto } from './next-service-action-type.dto';
import { ProviderDto } from './provider.dto';
import { ServiceStatusDto } from './service-status.dto';

export class ServiceDto {
    lastEvent?: HandlingEventDto;

    @ApiProperty({
        description: 'The latest payment gateway response from customer payment',
    })
    lastCustomerPaymentGatewayResponse?: PaymentGatewayResponseDto;

    @ApiProperty({
        description: 'The next service action type.',
    })
    nextActionType: NextServiceActionTypeDto;

    @ApiProperty({
        description: 'An allocated worker by an assigned dispatcher.',
    })
    provider: ProviderDto;

    @ApiProperty({
        description: 'The status of service request.',
    })
    status: ServiceStatusDto;

    @ApiPropertyOptional({
        description: 'The internal remarks of service request.',
    })
    remarks?: string;

    @ApiProperty({
        description: 'The refund status of service request.',
    })
    isRefunded: boolean;

    @ApiProperty({
        description: 'The refund eligible indicator of service request.',
    })
    eligibleForRefund: boolean;
}
