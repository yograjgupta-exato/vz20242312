import { ApiProperty } from '@nestjs/swagger';

export class BatchWiseDistanceSettingInput {
    @ApiProperty({
        default: 10,
        description: 'Maximum number of radius(km) allowed.',
        example: 10,
    })
    maxRadiusKm: number;

    @ApiProperty({
        default: 1,
        description: 'The number of radius(km) increment per iteration.',
        example: 1,
    })
    radiusIncrementKm: number;

    @ApiProperty({
        default: 5,
        description: 'The initial radius(km) for scanning.',
        example: 5,
    })
    startRadiusKm: number;
}