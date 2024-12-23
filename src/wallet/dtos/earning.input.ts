import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';
import { GroupByDate } from '@shared/enums/group-by-date';

export class EarningInput {
    @ApiProperty({
        description: 'An ISO-8601 encoded UTC date time string. `Example value: "2020-06-06T07:04:33Z".`',
        example: '2020-06-06T07:04:33Z',
        type: 'string',
    })
    @IsDate()
    @Type(() => Date)
    fromDate: Date;

    @ApiProperty({
        description: 'Options to summarize your earnings by daily, weekly, month or to date',
        enum: [GroupByDate.DAY, GroupByDate.WEEK, GroupByDate.MONTH, GroupByDate.TO_DATE],
        type: 'enum',
    })
    groupBy: GroupByDate;

    @ApiProperty({
        description: 'An ISO-8601 encoded UTC date time string. `Example value: "2020-07-04T06:06:33Z".`',
        example: '2020-07-04T06:06:33Z',
        type: 'string',
    })
    @IsDate()
    @Type(() => Date)
    toDate: Date;
}
