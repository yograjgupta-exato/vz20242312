import { QueryBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityNotFoundError } from '@shared/errors';
import { ServiceRequest } from '@service-request/entities/service-request.entity';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { FeedbackSubmittedCommand } from '../../../feedback/events/commands/feedback-submitted.command';
import { GetServiceRequestQuery } from '../../queries/get-service-request.query';

@CommandHandler(FeedbackSubmittedCommand)
export class ServiceRequestFeedbackSubmittedHandler implements ICommandHandler<FeedbackSubmittedCommand> {
    constructor(
        private readonly queryBus: QueryBus,
        @InjectRepository(ServiceRequest) private readonly serviceRequestRepository: Repository<ServiceRequest>,
    ) {}

    async execute(command: FeedbackSubmittedCommand): Promise<void> {
        const { feedbackTypeCode, feedback } = command;
        if (feedbackTypeCode === 'consumer-rating-feedbacks') {
            const serviceRequest: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(feedback.serviceTicketId));
            if (!serviceRequest) {
                throw new EntityNotFoundError('ServiceRequest', feedback.serviceTicketId);
            }

            serviceRequest.beforeSave();
            serviceRequest.changeCustomerRating({
                rating: feedback.rating || 0,
                option: feedback.option?.title,
                extraComment: feedback.extraComment,
            });
            await this.serviceRequestRepository.save(serviceRequest);
        }
    }
}
