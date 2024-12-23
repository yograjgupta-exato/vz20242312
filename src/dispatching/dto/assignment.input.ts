import { ApiProperty } from '@nestjs/swagger';
import { AutoAssignmentTypeEnum } from '../enums/auto-assignment-type.enum';
import { ScanningZoneTypeEnum } from '../enums/scanning-zone-type.enum';

export class AssignmentInput {
    @ApiProperty({
        description: 'The unique identifier of a service provider.',
    })
    providerId: string;

    @ApiProperty({
        description: 'the number of seconds to the agent for accepting the task.',
    })
    requestSeconds: number;

    @ApiProperty({
        description: 'The unique identifier of the service request.',
    })
    serviceRequestId: string;

    @ApiProperty({
        description: 'The auto assignment type.',
    })
    assignmentType: AutoAssignmentTypeEnum;

    @ApiProperty({
        description: 'The scanning zone type.',
    })
    scanningZoneType: ScanningZoneTypeEnum;
}
