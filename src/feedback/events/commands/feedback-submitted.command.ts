import { FeedbackResponse } from '../../feedback-response.entity';

export class FeedbackSubmittedCommand {
    constructor(public readonly feedbackTypeCode: string, public readonly feedback: FeedbackResponse) {}
}
