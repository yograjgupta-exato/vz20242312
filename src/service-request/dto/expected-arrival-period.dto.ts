import { ApiProperty } from '@nestjs/swagger';
import * as moment from 'moment';
import { Period } from '@shared/entities/period.entity';

export class ExpectedArrivalPeriodDto {
    @ApiProperty({
        description: 'The formatted date (YYYY-MM-DD)',
    })
    formattedDate: string;

    @ApiProperty({
        description: 'The formatted time at local TimeZone (GMT+8)',
    })
    formattedTime: string;

    @ApiProperty({
        description: 'The date and time (ISO 8601 format) after which the period becomes invalid.',
    })
    end: Date;

    @ApiProperty({
        description: 'The date and time (ISO 8601 format) after which the period is valid.',
    })
    start: Date;

    public constructor(expectedArrivalPeriod: Period) {
        this.formattedDate = moment
            .utc(expectedArrivalPeriod.start)
            .clone()
            .utcOffset(expectedArrivalPeriod.timezoneOffset)
            .format('YYYY-MM-DD');
        this.formattedTime = `${moment
            .utc(expectedArrivalPeriod.start)
            .clone()
            .utcOffset(expectedArrivalPeriod.timezoneOffset)
            .format('hh:mm A')} - ${moment
            .utc(expectedArrivalPeriod.end)
            .clone()
            .utcOffset(expectedArrivalPeriod.timezoneOffset)
            .format('hh:mm A')}`;
        this.start = expectedArrivalPeriod.start;
        this.end = expectedArrivalPeriod.end;
    }
}
