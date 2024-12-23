import { ApiProperty } from '@nestjs/swagger';
import { CurrencyCode } from '@shared/enums';

export class EarningSummaryRowDto {
    @ApiProperty({
        description: 'Decimal money amount',
        format: 'float',
        type: 'number',
    })
    amount: number;

    @ApiProperty({
        description: 'The three-letter code (ISO 4217 format) for the currency associated with amount.',
        enum: [CurrencyCode.Myr],
    })
    currency: CurrencyCode;

    @ApiProperty({
        description: 'The date string',
    })
    date: string;
}
