import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import * as moment from 'moment';
import { Column } from 'typeorm';
import { OptPeriod } from './opt-period.entity';

export class Period {
    @ApiProperty({
        description: 'The date and time (ISO 8601 format) after which the period becomes invalid.',
    })
    @Type(() => Date)
    @Column({
        comment: 'The date and time (ISO 8601 format) after which the period becomes invalid.',
        name: '_end',
        type: 'timestamptz',
    })
    end: Date;

    @ApiProperty({
        description: 'The date and time (ISO 8601 format) after which the period is valid.',
    })
    @Column({
        comment: 'The date and time (ISO 8601 format) after which the period is valid.',
        name: '_start',
        type: 'timestamptz',
    })
    @Type(() => Date)
    start: Date;

    @Column({
        name: '_timezone_offset',
        default: 0,
    })
    timezoneOffset?: number;

    public constructor(start: Date, end: Date, timezoneOffset = 8) {
        this.start = start;
        this.end = end;
        this.timezoneOffset = timezoneOffset;
    }

    getLocalStartDateString(format = 'Do MMM YYYY, hh:mm A'): string {
        return moment
            .utc(this.start)
            .clone()
            .utcOffset(this.timezoneOffset)
            .format(format);
    }

    getLocalEndDateString(format = 'Do MMM YYYY, hh:mm A'): string {
        return moment
            .utc(this.end)
            .clone()
            .utcOffset(this.timezoneOffset)
            .format(format);
    }

    toOptPeriod(): OptPeriod {
        const optPeriod = new OptPeriod();
        optPeriod.start = this.start;
        optPeriod.end = this.end;
        optPeriod.timezoneOffset = this.timezoneOffset;
        return optPeriod;
    }
}
