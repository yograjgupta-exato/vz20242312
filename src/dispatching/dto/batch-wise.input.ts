import { ApiProperty } from '@nestjs/swagger';
import { BatchWiseBatchLimitInput } from './batch-wise-batch-limit.input';
import { BatchWiseDistanceSettingInput } from './batch-wise-distance-setting.input';
import { BatchWiseDurationSettingInput } from './batch-wise-duration-setting.input';

export class BatchWiseInput {

    @ApiProperty({
        description: 'Represents a resource limit of batch formation.'
    })
    batchLimit: BatchWiseBatchLimitInput;

    @ApiProperty({
        description: 'Represents a distance setting.'
    })
    distanceSetting: BatchWiseDistanceSettingInput;

    @ApiProperty({
        description: 'Represents a duration setting.',
    })
    durationSetting: BatchWiseDurationSettingInput;

    @ApiProperty({
        default: 3,
        description: 'The number of retries.',
        example: 3,
        maximum: 8,
    })
    retries: number;
}