import { ApiProperty } from '@nestjs/swagger';

export class BatchWiseDurationSettingInput {

    @ApiProperty({
        default: 30,
        description: 'the number of seconds after which system generates next batches.',
        example: 30,
    })
    batchProcessingSeconds: number;

    @ApiProperty({
        default: 30,
        description: 'the number of seconds to the agent for accepting the task.',
        example: 30,
    })
    requestSeconds: number;
}