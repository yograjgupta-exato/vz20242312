import { Injectable, BadRequestException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { classToPlain } from 'class-transformer';
import { Repository } from 'typeorm';
import { LocaleString } from '@shared/types/locale.types';
import { FeedbackSubmittedCommand } from './events/commands/feedback-submitted.command';
import { FeedbackOptionTranslation } from './feedback-option-translation.entity';
import { FeedbackOption } from './feedback-option.entity';
import { FeedbackResponse } from './feedback-response.entity';
import { FeedbackType } from './feedback-type.entity';
import { FeedbackOptionInput, FeedbackResponseInput } from './feedback.dto';

@Injectable()
export class FeedbackService {
    constructor(
        @InjectRepository(FeedbackType) private feedbackRepository: Repository<FeedbackType>,
        @InjectRepository(FeedbackOption) private feedbackOptionRepository: Repository<FeedbackOption>,
        @InjectRepository(FeedbackResponse) private feedbackResponseRepository: Repository<FeedbackResponse>,
        private readonly commandBus: CommandBus,
    ) {}

    findAllFeedbackTypes(): Promise<FeedbackType[]> {
        return this.feedbackRepository.find();
    }

    findAllFeedbackOptions(feedbackTypeCode: string): Promise<FeedbackOption[]> {
        return this.feedbackOptionRepository.find({
            where: {
                typeCode: feedbackTypeCode,
            },
        });
    }

    async createOneFeedbackOption(feedbackTypeCode: string, feedbackOption: FeedbackOptionInput) {
        const option = new FeedbackOption({
            type: FeedbackType.for(feedbackTypeCode),
            title: feedbackOption.title,
            description: feedbackOption.description,
            translations: feedbackOption.translations.map(params => {
                const translation = new FeedbackOptionTranslation(classToPlain(params));
                return translation;
            }),
        });

        const result = await this.feedbackOptionRepository.save(option);
        return result;
    }

    async findOneFeedbackOption(feedbackTypeCode: string, feedbackOptionId: string): Promise<FeedbackOption> {
        const result = await this.feedbackOptionRepository.findOne(feedbackOptionId, { relations: ['translations'] });
        if (result.typeCode !== feedbackTypeCode) {
            throw new BadRequestException('Feedback type does not match requested option id');
        }
        return result;
    }

    async updateOneFeedbackOption(feedbackTypeCode: string, feedbackOptionId: string, input: FeedbackOptionInput): Promise<FeedbackOption> {
        const feedbackOption = await this.findOneFeedbackOption(feedbackTypeCode, feedbackOptionId);

        if (input.title) feedbackOption.title = input.title as LocaleString;
        if (input.description) feedbackOption.description = input.description as LocaleString;
        if (input.translations) feedbackOption.translations = input.translations.map(params => new FeedbackOptionTranslation(classToPlain(params)));

        const updatedFeedbackOption = await this.feedbackOptionRepository.save(feedbackOption);
        return updatedFeedbackOption;
    }

    removeFeedbackOption(feedbackTypeCode: string, feedbackOptionId: string): Promise<FeedbackOption> {
        const option = new FeedbackOption({
            id: feedbackOptionId,
            type: FeedbackType.for(feedbackTypeCode),
        });

        return this.feedbackOptionRepository.remove(option);
    }

    findAllFeedbackResponses(feedbackTypeCode: string): Promise<FeedbackResponse[]> {
        return this.feedbackResponseRepository
            .createQueryBuilder('response')
            .innerJoin('response.option', 'option')
            .where('option.type = :feedbackType', { feedbackType: FeedbackType.for(feedbackTypeCode) })
            .take(20)
            .getMany();
    }

    async createFeedbackResponse(feedbackTypeCode: string, input: FeedbackResponseInput): Promise<FeedbackResponse> {
        const response = new FeedbackResponse({ feedbackTypeCode, ...classToPlain(input) });
        if (input.optionId) {
            response.option = FeedbackOption.for(input.optionId);
        }
        const result = await this.feedbackResponseRepository.save(response);
        await this.commandBus.execute(new FeedbackSubmittedCommand(feedbackTypeCode, result));
        return result;
    }

    async findOneFeedbackResponse(feedbackTypeCode: string, responseId: string): Promise<FeedbackResponse> {
        const response = await this.feedbackResponseRepository.findOne(responseId, { relations: ['option'] });
        if (response.option.typeCode !== feedbackTypeCode) {
            throw new BadRequestException(`Feedback response does not belong to feedback type "${feedbackTypeCode}"`);
        }
        return response;
    }
}
