import { IsNotEmpty } from 'class-validator';
import { LanguageCode } from '@shared/enums';

export class FeedbackOptionTranslationInput {
    id?: string;
    baseId?: string;
    languageCode: LanguageCode;
    title: string;
    description: string;
}

export class FeedbackOptionInput {
    title: string;
    description: string;
    translations: FeedbackOptionTranslationInput[];
}

export class FeedbackResponseInput {
    optionId?: string;

    extraComment?: string;

    rating?: number;

    @IsNotEmpty()
    serviceTicketId: string;
}
