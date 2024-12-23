import { ApiProperty } from '@nestjs/swagger';
export class BatchWiseDurationSetting {

    @ApiProperty({
        default: 30,
        description: 'the number of seconds after which system generates next batches.'
    })
    batchProcessingSeconds: number;

    @ApiProperty({
        default: 30,
        description: 'the number of seconds to the agent for accepting the task.'
    })
    requestSeconds: number;
}