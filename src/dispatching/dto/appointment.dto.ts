import { ApiProperty } from '@nestjs/swagger';
import { ServiceRequestDto } from '@service-request/dto/service-request.dto';

export class AppointmentDto {
    @ApiProperty({
        description: 'The date string in the format of "YYYY-MM-DD".'
    })
    date: string;

    @ApiProperty({
        description: 'The allocated/completed job of the day.',
        type: [ServiceRequestDto]
    })
    serviceRequests: ServiceRequestDto[];
}