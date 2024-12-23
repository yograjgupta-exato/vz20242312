import { PartialType, ApiProperty } from '@nestjs/swagger';
import { DeepPartial } from 'typeorm';
import { PaymentCheckoutInfoDto } from '@payment/dtos/payment-checkout-info.dto';
import { ServiceRequestDto } from './service-request.dto';

export class CheckoutServiceRequestDto extends PartialType(ServiceRequestDto) {
    @ApiProperty({
        description: '',
        type: 'number',
        format: 'float',
    })
    paymentCheckoutInfo?: PaymentCheckoutInfoDto;

    private constructor(dto?: DeepPartial<ServiceRequestDto>) {
        super();
        for (const [key, value] of Object.entries(dto)) {
            (this as any)[key] = value;
        }
    }

    public static from(srDto: ServiceRequestDto, pcDto: PaymentCheckoutInfoDto): CheckoutServiceRequestDto {
        const checkoutServiceRequestDto = new CheckoutServiceRequestDto(srDto);
        checkoutServiceRequestDto.paymentCheckoutInfo = pcDto;
        return checkoutServiceRequestDto;
    }
}
