import { Controller, Get, Param, Post, Body, Put, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CustomApiHeaders } from '@shared/decorators';
import { FeedbackOptionInput, FeedbackResponseInput } from './feedback.dto';
import { FeedbackService } from './feedback.service';

@ApiTags('feedback')
@CustomApiHeaders()
@Controller('feedbacks')
export class FeedbackController {
    constructor(private readonly service: FeedbackService) {}

    @Get()
    indexFeedbackTypes() {
        return this.service.findAllFeedbackTypes();
    }

    @Get(':type/options')
    indexFeedbackOptions(@Param('type') type: string) {
        return this.service.findAllFeedbackOptions(type);
    }

    @Post(':type/options')
    createFeedbackOptions(@Param('type') type: string, @Body() input: FeedbackOptionInput) {
        return this.service.createOneFeedbackOption(type, input);
    }

    @Get(':type/options/:id')
    getFeedbackOption(@Param('type') type: string, @Param('id') id) {
        return this.service.findOneFeedbackOption(type, id);
    }

    @Put(':type/options/:id')
    updateFeedbackOptions(@Param('type') type: string, @Param('id') id, @Body() input: FeedbackOptionInput) {
        return this.service.updateOneFeedbackOption(type, id, input);
    }

    @Delete(':type/options/:id')
    async deleteFeedbackOptions(@Param('type') type, @Param('id') id) {
        const success = await this.service.removeFeedbackOption(type, id);
        return { success };
    }

    @Get(':type/responses')
    indexFeedbackResponses(@Param('type') type: string) {
        return this.service.findAllFeedbackResponses(type);
    }

    @Post(':type/responses')
    submitFeedbackResponses(@Param('type') type: string, @Body() input: FeedbackResponseInput) {
        return this.service.createFeedbackResponse(type, input);
    }

    @Get(':type/responses/:id')
    getFeedbackResponses(@Param('type') type: string, @Param('id') id) {
        return this.service.findOneFeedbackResponse(type, id);
    }
}
