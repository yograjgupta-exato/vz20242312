import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetHandlingEventsOfServiceRequestQuery } from '../get-handling-events-of-service-request.query';
import { HandlingEvent } from 'handling/entities/handling-event.entity';

@QueryHandler(GetHandlingEventsOfServiceRequestQuery)
export class GetHandlingEventsOfServiceRequestHandler implements IQueryHandler<GetHandlingEventsOfServiceRequestQuery> {
    constructor(@InjectRepository(HandlingEvent) private readonly repository: Repository<HandlingEvent>) {}

    async execute(query: GetHandlingEventsOfServiceRequestQuery): Promise<HandlingEvent[]> {
        const { serviceRequestId } = query;
        return this.repository.find({ serviceRequestId });
    }
}
