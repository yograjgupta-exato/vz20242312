import { ApiProperty } from '@nestjs/swagger';
import * as moment from 'moment';
import { Column } from 'typeorm';
import { Period } from './period.entity';

export class OptPeriod {
    @ApiProperty({
        description: 'The date and time (ISO 8601 format) after which the period becomes invalid.',
    })
    @Column({
        comment: 'The date and time (ISO 8601 format) after which the period becomes invalid.',
        name: '_end',
        nullable: true,
        type: 'timestamptz',
    })
    end?: Date;

    @ApiProperty({
        description: 'The date and time (ISO 8601 format) after which the period is valid.',
    })
    @Column({
        comment: 'The date and time (ISO 8601 format) after which the period is valid.',
        name: '_start',
        nullable: true,
        type: 'timestamptz',
    })
    start?: Date;

    @ApiProperty({
        description: 'The timezone offset for period.',
    })
    @Column({
        comment: 'The date and time (ISO 8601 format) after which the period is valid.',
        name: '_timezone_offset',
        default: 8,
    })
    timezoneOffset: number;

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

    toPeriod(): Period {
        return new Period(this.start, this.end, this.timezoneOffset);
    }
}
