import { Logger } from '@nestjs/common';
import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Repository, MoreThan } from 'typeorm';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { GetServiceRequestQuery } from '@service-request/queries/get-service-request.query';
import { GetNewDispatchedJobsOfProviderQuery } from '../get-new-dispatched-jobs-of-provider.query';
import { JobDtoFactory } from 'dispatching/dto/factories/job.dto.factory';
import { JobDto } from 'dispatching/dto/job.dto';
import { Assignment } from 'dispatching/entities/assignment.entity';
import { AssignmentStatusEnum } from 'dispatching/enums/assignment-status.enum';

@QueryHandler(GetNewDispatchedJobsOfProviderQuery)
export class GetNewDispatchedJobsOfProviderHandler implements IQueryHandler<GetNewDispatchedJobsOfProviderQuery> {
    constructor(private readonly queryBus: QueryBus, @InjectRepository(Assignment) private readonly assignmentRepository: Repository<Assignment>) { }

    private readonly logger = new Logger(GetNewDispatchedJobsOfProviderHandler.name);

    async execute(query: GetNewDispatchedJobsOfProviderQuery): Promise<JobDto[]> {
        const { providerId } = query;
        this.logger.log(`get newly dispatched job for provider: ${providerId}`);

        const assignments = await this.assignmentRepository.find({
            where: {
                providerId,
                expiredAt: MoreThan(moment.utc().toDate()),
                status: AssignmentStatusEnum.PENDING,
            },
        });

        // note(roy): ramification on latency & throughput for hitting db.
        const promises = assignments.map(async d => {
            const serviceRequest: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(d.serviceRequestId));
            return JobDtoFactory.create(serviceRequest, d.getCurrentRequestSeconds());
        });

        return Promise.all<JobDto>(promises);
    }
}
