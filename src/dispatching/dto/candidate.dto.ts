import { ApiProperty, PartialType } from '@nestjs/swagger';
import { ServiceProvider } from 'service-provider/service-provider.entity';

export class CandidateDto extends PartialType(ServiceProvider) {
    @ApiProperty({
        description: 'The distance between service request location and the candidate using Haversine formula',
        type: 'number',
        format: 'float',
    })
    distanceKm?: number;
}
