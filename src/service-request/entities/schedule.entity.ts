import { ApiProperty } from '@nestjs/swagger';
import { Column } from 'typeorm';
import { OptPeriod } from '@shared/entities/opt-period.entity';

export class Schedule {
    @ApiProperty({
        description: 'Blocks workers from getting other service-job for a duration of time after the end of servicePeriod.'
    })
    @Column({
        default: null,
        name: '_block_after_in_minutes',
        nullable: true,
    })
    blockAfterInMinutes?: number;

    @ApiProperty({
        description: 'Blocks workers from getting other service-job for a duration of time before the start of servicePeriod.'
    })
    @Column({
        default: null,
        name: '_block_before_in_minutes',
        nullable: true,
    })
    blockBeforeInMinutes?: number;

    @Column(() => OptPeriod)
    period: OptPeriod;
}