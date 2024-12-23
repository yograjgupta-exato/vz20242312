import { ApiProperty } from '@nestjs/swagger';
import { BatchWiseBatchLimit } from './batch-wise-batch-limit.entity';
import { BatchWiseDistanceSetting } from './batch-wise-distance-setting.entity';
import { BatchWiseDurationSetting } from './batch-wise-duration-setting.entity';

export class BatchWise {
    @ApiProperty({
        description: 'Represents a resource limit of batch formation.'
    })
    batchLimit: BatchWiseBatchLimit;

    @ApiProperty({
        description: 'Represents a distance setting.'
    })
    distanceSetting: BatchWiseDistanceSetting;

    @ApiProperty({
        description: 'Represents a duration setting.',
    })
    durationSetting: BatchWiseDurationSetting;

    @ApiProperty({
        default: 0,
        description: 'The number of retries.',
        maximum: 8,
    })
    retries: number;
}