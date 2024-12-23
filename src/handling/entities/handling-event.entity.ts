import { Column, Entity, DeepPartial, Index } from 'typeorm';
import { AbstractEntity } from '@shared/entities/abstract.entity';
import { HandlingEventTypeEnum } from '../enums/handling-event-type.enum';

@Entity({ name: 'handling_events' })
export class HandlingEvent extends AbstractEntity {
    constructor(input?: DeepPartial<HandlingEvent>) {
        super(input);
    }

    @Column('decimal', {
        comment: 'The latitude coordinates of the location',
        precision: 10,
        scale: 6,
    })
    latitude: number;

    @Column('decimal', {
        comment: 'The longitude coordinates of the location',
        precision: 10,
        scale: 6,
    })
    longitude: number;

    @Column({
        comment: "The unique identifier of a provider's worker",
        type: 'uuid',
    })
    @Index()
    providerWorkerId: string;

    @Column({
        comment: 'The unique identifier of a service request.',
    })
    serviceRequestId: string;

    @Column({
        comment: 'It describes the type of a handling event on the service.',
        default: HandlingEventTypeEnum.START,
        enum: HandlingEventTypeEnum,
        type: 'enum',
    })
    type: HandlingEventTypeEnum;
}
