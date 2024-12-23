import { ApiProperty } from '@nestjs/swagger';
import { ServiceStatusDto } from '@service-request/dto/service-status.dto';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { JobRequestDto } from './job-request.dto';

export class JobDto {
    @ApiProperty({
        description: 'The number of seconds left to Dealer/Freelancer for accepting the job.',
        nullable: true,
        required: false,
        default: undefined,
    })
    requestTimeoutSeconds?: number;

    @ApiProperty({
        description: 'The service request created by Customer.',
    })
    serviceRequest: JobRequestDto;

    @ApiProperty({
        description: 'The status of service request.',
    })
    status: ServiceStatusDto;

    public constructor(sr: IServiceRequest, requestTimeoutSeconds?: number) {
        this.requestTimeoutSeconds = requestTimeoutSeconds;
        this.serviceRequest = new JobRequestDto(sr.toDto());
    }
}
