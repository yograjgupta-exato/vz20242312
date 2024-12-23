import { QueryHandler, IQueryHandler, QueryBus } from '@nestjs/cqrs';
import * as moment from 'moment';
import { getCustomRepository } from 'typeorm';
import { AppConfigService } from '@shared/config';
import { ReportFrequency } from '@shared/enums/report-frequency';
import { EntityNotFoundError } from '@shared/errors';
import { ServiceRequestRepository } from '@service-request/repository/service-request.repository';
import { GetJobSummaryQuery } from '../get-job-summary.query';
import { JobSummaryDto } from 'service-provider/dto/job-summary.dto';
import { IServiceProvider } from 'service-provider/interfaces/service-provider.interface';
import { GetServiceProviderQuery } from 'service-provider/queries/get-service-provider.query';

@QueryHandler(GetJobSummaryQuery)
export class GetJobSummaryHandler implements IQueryHandler<GetJobSummaryQuery> {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly configService: AppConfigService,
    ) { }

    async execute(query: GetJobSummaryQuery): Promise<JobSummaryDto> {
        const { providerId, frequency, date } = query;

        const serviceProvider: IServiceProvider = await this.queryBus.execute(new GetServiceProviderQuery(providerId));
        if (!serviceProvider) {
            throw new EntityNotFoundError('ServiceProvider', providerId);
        }

        const timezoneOffset = this.configService.timezoneOffset;
        let start = moment();
        let end = moment();
        switch (frequency) {
            case ReportFrequency.WEEKLY:
                start = moment(date)
                    .utcOffset(timezoneOffset)
                    .clone()
                    .startOf('isoWeek');
                end = moment(date)
                    .utcOffset(timezoneOffset)
                    .clone()
                    .endOf('isoWeek');
                break;

            case ReportFrequency.MONTHLY:
                start = moment(date)
                    .utcOffset(timezoneOffset)
                    .clone()
                    .startOf('month');
                end = moment(date)
                    .utcOffset(timezoneOffset)
                    .clone()
                    .endOf('month');
                break;
            default:
                start = moment(date)
                    .utcOffset(timezoneOffset)
                    .clone()
                    .startOf('isoWeek');
                end = moment(date)
                    .utcOffset(timezoneOffset)
                    .clone()
                    .endOf('isoWeek');
        }
        const serviceRequestRepo = getCustomRepository(ServiceRequestRepository);
        return await serviceRequestRepo.findJobSummaryOfProvider(serviceProvider, start.toDate(), end.toDate());
    }
}
