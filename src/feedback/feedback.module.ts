import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackOptionTranslation } from './feedback-option-translation.entity';
import { FeedbackOption } from './feedback-option.entity';
import { FeedbackResponse } from './feedback-response.entity';
import { FeedbackType } from './feedback-type.entity';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';

@Module({
    imports: [CqrsModule, TypeOrmModule.forFeature([FeedbackType, FeedbackOption, FeedbackOptionTranslation, FeedbackResponse])],
    controllers: [FeedbackController],
    providers: [FeedbackService],
})
export class FeedbackModule {}
