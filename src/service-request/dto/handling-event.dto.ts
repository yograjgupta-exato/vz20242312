import { ApiProperty } from '@nestjs/swagger';
import { HandlingEventTypeEnum } from 'handling/enums/handling-event-type.enum';

export class HandlingEventDto {
    @ApiProperty({
        description: 'The latitude coordinates of the location',
    })
    latitude: number;

    @ApiProperty({
        description: 'The longitude coordinates of the location',
    })
    longitude: number;

    @ApiProperty({
        description: "The unique identifier of a provider's worker",
    })
    providerWorkerId: string;

    @ApiProperty({
        description: 'The unique identifier of a service request.',
    })
    serviceRequestId: string;

    @ApiProperty({
        description: 'It describes the type of a handling event on the service.',
        type: 'enum',
    })
    type: HandlingEventTypeEnum;
}
