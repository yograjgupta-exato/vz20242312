import { ApiProperty } from '@nestjs/swagger';
import { EarningSummaryRowDto } from './earning-summary-row.dto';

export class EarningSummaryDto {
    rows: EarningSummaryRowDto[];

    @ApiProperty({
        description: 'Total amount in earnings',
        format: 'float',
        type: 'number',
    })
    total: number;

    static from(rows: EarningSummaryRowDto[]): EarningSummaryDto {
        const dto = new EarningSummaryDto();
        dto.rows = rows;
        dto.total = dto.rows.reduce((sum, row) => sum + Number(row.amount), 0);
        return dto;
    }
}
