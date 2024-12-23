import { ApiProperty } from '@nestjs/swagger';
import { CurrencyCode } from '@shared/enums';

export class MoneyDto {
    @ApiProperty({
        description: 'Decimal money amount.',
    })
    amount: number;

    @ApiProperty({
        description: 'Currency of the money.',
    })
    currency: CurrencyCode;

    constructor(amount: number, currency: CurrencyCode) {
        this.amount = amount;
        this.currency = currency;
    }
}
