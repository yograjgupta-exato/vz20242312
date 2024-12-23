import { ApiProperty } from '@nestjs/swagger';

export class HandleServicingJobInput {
    @ApiProperty({
        description: 'The latitude coordinates of the location',
        example: 3.139,
        format: 'float',
        type: 'number',
    })
    latitude: number;

    @ApiProperty({
        description: 'The longitude coordinates of the location',
        example: 101.6869,
        format: 'float',
        type: 'number',
    })
    longitude: number;

    @ApiProperty({
        description: 'Verification code is used to verify when job is completed.',
    })
    verificationCode?: string;
}
