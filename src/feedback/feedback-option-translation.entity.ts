import { Column, RelationId, ManyToOne, Entity } from 'typeorm';
import { AbstractEntity } from '@shared/entities/abstract.entity';
import { LanguageCode } from '@shared/enums';
import { Translation } from '@shared/types/locale.types';
import { FeedbackOption } from './feedback-option.entity';

@Entity()
export class FeedbackOptionTranslation extends AbstractEntity implements Translation<FeedbackOption> {
    constructor(props) {
        super(props);
    }

    @Column('varchar')
    languageCode: LanguageCode;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @ManyToOne(
        () => FeedbackOption,
        base => base.translations,
        { onDelete: 'CASCADE' },
    )
    base: FeedbackOption;

    @RelationId((item: FeedbackOptionTranslation) => item.base)
    baseId: string;
}
