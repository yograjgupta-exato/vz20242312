import { Entity, ManyToOne, JoinColumn, Column, RelationId, OneToMany } from 'typeorm';
import { AbstractEntity } from '@shared/entities/abstract.entity';
import { LocaleString, Translation } from '@shared/types/locale.types';
import { FeedbackOptionTranslation } from './feedback-option-translation.entity';
import { FeedbackResponse } from './feedback-response.entity';
import { FeedbackType } from './feedback-type.entity';

@Entity()
export class FeedbackOption extends AbstractEntity {
    constructor(props) {
        super(props);
    }

    @ManyToOne(
        () => FeedbackType,
        feedbackType => feedbackType.options,
    )
    @JoinColumn()
    type: FeedbackType;

    @RelationId((item: FeedbackOption) => item.type)
    @Column()
    typeCode: string;

    @Column()
    title: LocaleString;

    @Column({ nullable: true })
    description: LocaleString;

    @OneToMany(
        () => FeedbackOptionTranslation,
        translations => translations.base,
        { eager: false, cascade: false, onDelete: 'CASCADE' },
    )
    translations: Translation<FeedbackOptionTranslation>[];

    @OneToMany(
        () => FeedbackResponse,
        responses => responses.option,
    )
    responses: FeedbackResponse[];

    static for(id: string): FeedbackOption {
        return new FeedbackOption({ id });
    }
}
