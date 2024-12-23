import { ApiProperty } from '@nestjs/swagger';

export class AppointmentSummaryDto {
    @ApiProperty({
        description: 'The date string in the format of "YYYY-MM-DD".'
    })
    date: string;

    @ApiProperty({
        description: 'total allocated jobs.'
    })
    totalAllocatedOrCompletedJobs: number;
}