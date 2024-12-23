import { Entity, Column, ManyToOne, RelationId } from 'typeorm';
import { AbstractEntity } from '@shared/entities/abstract.entity';
import { FeedbackOption } from './feedback-option.entity';

@Entity()
export class FeedbackResponse extends AbstractEntity {
    constructor(props) {
        super(props);
    }

    @Column({ nullable: true })
    extraComment?: string;

    @Column({ nullable: true })
    rating?: number;

    @ManyToOne(
        () => FeedbackOption,
        base => base.responses,
        { onDelete: 'CASCADE', nullable: true },
    )
    option?: FeedbackOption;

    @RelationId((item: FeedbackResponse) => item.option)
    optionId?: string;

    @Column()
    feedbackTypeCode: string;

    @Column()
    serviceTicketId: string;
}
