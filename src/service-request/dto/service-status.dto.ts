import { ApiProperty } from '@nestjs/swagger';
import { ServiceStatusEnum } from '@service-request/entities/service-status.enum';

export class ServiceStatusDto {
    @ApiProperty({
        description: 'The code of service status.',
    })
    code: ServiceStatusEnum;

    @ApiProperty({
        description: 'A human-friendly unique string for the Code',
    })
    name: string;
}
