import { ApiProperty } from '@nestjs/swagger';

export class BatchWiseBatchLimit {

    @ApiProperty({
        default: 5,
        description: 'Maximum number of batches formed in one try.'
    })
    size: number;

    @ApiProperty({
        default: 10,
        description: 'Maximum number of agents who will be sent a request in an attempt.',
    })
    maxAgents: number;
}
