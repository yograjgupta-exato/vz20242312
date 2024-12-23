import { ApiProperty } from '@nestjs/swagger';
import * as moment from 'moment';
import { Column } from 'typeorm';
import { Period } from '@shared/entities/period.entity';
import { LessThanExpectedArrivalWindowHourError } from '@shared/errors';

export class Appointment {
    @ApiProperty({
        description: 'Blocks workers from getting other service-job for a duration of time after the end of servicePeriod.',
    })
    @Column({
        default: null,
        name: '_block_after_in_minutes',
        nullable: true,
    })
    blockAfterInMinutes?: number;

    @ApiProperty({
        description: 'Blocks workers from getting other service-job for a duration of time before the start of servicePeriod.',
    })
    @Column({
        default: null,
        name: '_block_before_in_minutes',
        nullable: true,
    })
    blockBeforeInMinutes?: number;

    @ApiProperty({
        description: 'A time period of expected arrival.',
    })
    @Column(() => Period)
    expectedArrivalPeriod: Period;

    @ApiProperty({
        description: 'Actual servicing schedule (expectedArrivalPeriod + totalServiceMinutes)',
    })
    @Column(() => Period)
    serviceSchedule: Period;

    @ApiProperty({
        description: 'Total servicing duration in minutes.',
    })
    @Column({
        name: '_total_service_minutes',
        default: 0,
    })
    totalServiceMinutes: number;

    public constructor(
        expectedArrivalPeriod: Period,
        totalServiceMinutes: number,
        expectedArrivalWindowHour: number,
        blockBeforeInMinutes: number,
        blockAfterInMinutes: number,
        timezoneOffset: number,
        now: Date,
    ) {
        if (expectedArrivalPeriod === undefined || totalServiceMinutes === undefined) {
            return;
        }

        if (moment.utc(expectedArrivalPeriod.start).isBefore(moment.utc(now).add(expectedArrivalWindowHour, 'hours'))) {
            throw new LessThanExpectedArrivalWindowHourError(expectedArrivalWindowHour);
        }

        expectedArrivalPeriod.timezoneOffset = timezoneOffset;
        this.blockAfterInMinutes = blockAfterInMinutes;
        this.blockBeforeInMinutes = blockBeforeInMinutes;
        this.totalServiceMinutes = totalServiceMinutes;
        this.expectedArrivalPeriod = expectedArrivalPeriod;
        this.serviceSchedule = this.calculateServiceSchedule(timezoneOffset);
    }

    private calculateServiceSchedule(timezoneOffset: number) {
        return new Period(
            this.expectedArrivalPeriod.start,
            moment
                .utc(this.expectedArrivalPeriod.start)
                .clone()
                .add(this.totalServiceMinutes, 'minutes')
                .toDate(),
            timezoneOffset,
        );
    }

    public isExpectedArrivalTimeEqualTo(dateTime: Date): boolean {
        return new Date(dateTime).getTime() === this.expectedArrivalPeriod.start.getTime();
    }

    public isExpectedArrivalTimeLessThanDurationFromNow(hours: number, now?: Date): boolean {
        now = now ?? moment.utc().toDate();
        return moment.utc(this.expectedArrivalPeriod.start).diff(moment.utc(now), 'hours') <= hours;
    }

    public isExpectedArrivalTimeMoreThanDurationFromNow(hours: number, now?: Date): boolean {
        now = now ?? moment.utc().toDate();
        return moment.utc(this.expectedArrivalPeriod.start).diff(moment.utc(now), 'hours') >= hours;
    }

    public isWorkerScheduleOverlapped(start: Date, end: Date): boolean {
        const start1 = moment
            .utc(this.expectedArrivalPeriod.start)
            .clone()
            .unix();
        const end1 = moment
            .utc(this.expectedArrivalPeriod.start)
            .clone()
            .add(this.totalServiceMinutes, 'minutes')
            .unix();
        const start2 = moment
            .utc(start)
            .clone()
            .unix();
        const end2 = moment
            .utc(end)
            .clone()
            .unix();

        return (start1 >= start2 && start1 <= end2) || (start2 >= start1 && start2 <= end1);
    }

    public secondsTillExpectedArrivalDate(now?: Date): number {
        now = now ?? moment.utc().toDate();
        return moment.utc(this.expectedArrivalPeriod.start).diff(moment.utc(now), 'seconds');
    }
}
