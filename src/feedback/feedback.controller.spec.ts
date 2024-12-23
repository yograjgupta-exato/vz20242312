import { CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FeedbackOption } from './feedback-option.entity';
import { FeedbackResponse } from './feedback-response.entity';
import { FeedbackType } from './feedback-type.entity';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';

describe('Feedback Controller', () => {
    let controller: FeedbackController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [CqrsModule],
            controllers: [FeedbackController],
            providers: [
                FeedbackService,
                {
                    provide: getRepositoryToken(FeedbackType),
                    useValue: {},
                },
                {
                    provide: getRepositoryToken(FeedbackOption),
                    useValue: {},
                },
                {
                    provide: getRepositoryToken(FeedbackResponse),
                    useValue: {},
                },
            ],
        }).compile();

        controller = module.get<FeedbackController>(FeedbackController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
