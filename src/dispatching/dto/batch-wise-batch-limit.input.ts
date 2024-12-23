import { ApiProperty } from '@nestjs/swagger';

export class BatchWiseBatchLimitInput {

    @ApiProperty({
        default: 3,
        description: 'Maximum number of batches formed in one try.',
        example: 3,
    })
    size: number;

    @ApiProperty({
        default: 2,
        description: 'Maximum number of agents who will be sent a request in an attempt.',
        example: 2,
    })
    maxAgents: number;
}
