import { CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FeedbackOption } from './feedback-option.entity';
import { FeedbackResponse } from './feedback-response.entity';
import { FeedbackType } from './feedback-type.entity';
import { FeedbackService } from './feedback.service';

describe('FeedbackService', () => {
    let service: FeedbackService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [CqrsModule],
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

        service = module.get<FeedbackService>(FeedbackService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
