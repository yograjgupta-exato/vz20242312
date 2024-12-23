import * as moment from 'moment';
import { Entity, Column, DeepPartial, Unique } from 'typeorm';
import { AbstractEntity } from '@shared/entities/abstract.entity';
import { AssignmentStatusEnum } from '../enums/assignment-status.enum';
import { AutoAssignmentTypeEnum } from '../enums/auto-assignment-type.enum';
import { ScanningZoneTypeEnum } from '../enums/scanning-zone-type.enum';

// refactor(roy): shall we distinguish between manual and auto assignment?
@Entity({
    name: 'assignments',
})
export class Assignment extends AbstractEntity {
    constructor(input?: DeepPartial<Assignment>) {
        super(input);
    }

    @Column({ type: 'uuid' })
    providerId: string;

    @Column({
        nullable: true,
    })
    acceptedAt?: Date;

    @Column({
        type: 'timestamptz',
    })
    expiredAt: Date;

    @Column()
    serviceRequestId: string;

    @Column({
        default: AssignmentStatusEnum.FAILED,
        enum: AssignmentStatusEnum,
        type: 'enum',
    })
    status: AssignmentStatusEnum;

    @Column({
        default: AutoAssignmentTypeEnum.SEND_TO_ALL,
        enum: AutoAssignmentTypeEnum,
        type: 'enum',
    })
    assignmentType: AutoAssignmentTypeEnum;

    @Column({
        default: ScanningZoneTypeEnum.NONE,
        enum: ScanningZoneTypeEnum,
        type: 'enum',
        nullable: true,
    })
    scanningZoneType?: ScanningZoneTypeEnum;

    public changeRequestSeconds(requestSeconds: number) {
        this.expiredAt = moment
            .utc()
            .add(requestSeconds, 'seconds')
            .toDate();
    }

    public getCurrentRequestSeconds(): number {
        return moment.utc(this.expiredAt).diff(moment.utc(), 'seconds');
    }
}
