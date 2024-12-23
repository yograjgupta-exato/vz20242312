import { ApiProperty } from '@nestjs/swagger';

export class ManualAssignmentInput {
    @ApiProperty({
        description: 'The unique identifier of the service provider.',
    })
    providerId: string;
}
