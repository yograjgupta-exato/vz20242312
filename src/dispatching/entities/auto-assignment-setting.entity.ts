import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, DeepPartial } from 'typeorm';
import { AbstractEntity } from '@shared/entities/abstract.entity';
import { BatchWise } from './batch-wise.entity';
import { SendToAll } from './send-to-all.entity';
import { AutoAssignmentTypeEnum } from 'dispatching/enums/auto-assignment-type.enum';
import { ScanningZoneTypeEnum } from 'dispatching/enums/scanning-zone-type.enum';

@Entity('auto_assignment_settings')
export class AutoAssignmentSetting extends AbstractEntity {
    constructor(input?: DeepPartial<AutoAssignmentSetting>) {
        super(input);
    }

    @ApiProperty({
        description: 'The auto-assignment type.',
    })
    @Column({
        comment: 'The auto-assignment type.',
        default: AutoAssignmentTypeEnum.BATCH_WISE,
        enum: AutoAssignmentTypeEnum,
        type: 'enum',
    })
    autoAssignmentType: AutoAssignmentTypeEnum;

    @ApiProperty({
        description: `Sends the task request notification to Agent in batches. 
        You can create batches based on distance, time and group size settings .
        The task gets assigned to the Agent who accepts the task request first. 
        If no Agent accepts the task, it remains unassigned.`,
    })
    @Column('simple-json', { nullable: true })
    batchWise?: BatchWise;

    @ApiProperty({
        description: `Sends the task request notification to the Agent available in the task time-slot. 
        The task gets assigned to the "Agent who accepts the task request first. 
        If no Agent accepts the task, it remains unassigned.`,
        required: false,
    })
    @Column('simple-json', { nullable: true })
    sendToAll?: SendToAll;

    @ApiProperty({
        description: 'The scanning zone type.',
    })
    @Column({
        comment: 'The auto-assignment type.',
        default: ScanningZoneTypeEnum.NONE,
        enum: ScanningZoneTypeEnum,
        type: 'enum',
    })
    scanningZoneType: ScanningZoneTypeEnum;
}
