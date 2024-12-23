import { ApiProperty } from '@nestjs/swagger';

export class BatchWiseDistanceSetting {
    @ApiProperty({
        default: 10,
        description: 'Maximum number of radius(km) allowed.'
    })
    maxRadiusKm: number;

    @ApiProperty({
        default: 1,
        description: 'The number of radius(km) increment per iteration.'
    })
    radiusIncrementKm: number;

    @ApiProperty({
        default: 5,
        description: 'The initial radius(km) for scanning.'
    })
    startRadiusKm: number;
}