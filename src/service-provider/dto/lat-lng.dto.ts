import { ApiProperty } from '@nestjs/swagger';

export class LatLngDto {
    @ApiProperty({
        description: 'The latitude coordinates of the location',
        example: 3.1068,
        type: 'number',
        format: 'float',
    })
    latitude: number;

    @ApiProperty({
        description: 'The longitude coordinates of the location',
        example: 101.7259,
        type: 'number',
        format: 'float',
    })
    longitude: number;
}
