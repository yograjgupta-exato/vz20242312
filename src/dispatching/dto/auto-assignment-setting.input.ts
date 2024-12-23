import { ApiProperty } from '@nestjs/swagger';
import { BatchWiseInput } from './batch-wise.input';
import { OneByOneInput } from './one-by-one.input';
import { SendToAllInput } from './send-to-all.input';
import { AutoAssignmentTypeEnum } from 'dispatching/enums/auto-assignment-type.enum';

export class AutoAssignmentSettingInput {
    @ApiProperty({
        description: 'The auto-assignment type.',
    })
    autoAssignmentType: AutoAssignmentTypeEnum;

    @ApiProperty({
        description: `Sends the task request notification to Agent in batches. 
        You can create batches based on distance, time and group size settings .
        The task gets assigned to the Agent who accepts the task request first. 
        If no Agent accepts the task, it remains unassigned.`,
        required: false,
    })
    batchWise?: BatchWiseInput;

    @ApiProperty({
        description: `Sends the task request notification to the Agent nearest to the task Location. 
        If the Agent doesn’t accept the task within the request expiry time, the task request is sent to the next nearest Agent. 
        If no Agent accepts the task, it remains unassigned.`,
        required: false,
    })
    oneByOne?: OneByOneInput;

    @ApiProperty({
        description: `Sends the task request notification to the Agent available in the task time-slot. 
        The task gets assigned to the "Agent who accepts the task request first. 
        If no Agent accepts the task, it remains unassigned.`,
        required: false,
    })
    sendToAll?: SendToAllInput;
}
