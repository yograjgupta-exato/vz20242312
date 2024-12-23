import { ApiProperty } from '@nestjs/swagger';

export class JobSummaryDto {
    @ApiProperty({
        default: 0,
        description: 'The completed jobs count',
    })
    completedJobsCount: number;

    @ApiProperty({
        default: 0,
        description: 'The completed jobs earning',
    })
    completedJobsEarning: number;

    @ApiProperty({
        default: 0,
        description: 'The scheduled jobs count',
    })
    scheduledJobsCount: number;
}
