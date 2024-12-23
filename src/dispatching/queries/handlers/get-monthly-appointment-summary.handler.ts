import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Repository, In } from 'typeorm';
import { AppConfigService } from '@shared/config';
import { AppointmentStatusEnum } from '../../enums/appointment-status.enum';
import { GetMonthlyAppointmentSummaryQuery } from '../get-monthly-appointment-summary.query';
import { AppointmentSummaryDto } from 'dispatching/dto/appointment-summary.dto';
import { Appointment } from 'dispatching/entities/appointment.entity';

@QueryHandler(GetMonthlyAppointmentSummaryQuery)
export class GetMonthlyAppointmentSummaryHandler implements IQueryHandler<GetMonthlyAppointmentSummaryQuery> {
    constructor(
        @InjectRepository(Appointment) private readonly allocationRepository: Repository<Appointment>,
        private readonly configService: AppConfigService,
    ) {}

    async execute(query: GetMonthlyAppointmentSummaryQuery): Promise<AppointmentSummaryDto[]> {
        const { providerId } = query;
        let { monthOfYear } = query;
        const status = {
            status: In([AppointmentStatusEnum.ALLOCATED, AppointmentStatusEnum.FULFILLED]),
        };

        monthOfYear =
            monthOfYear ??
            moment()
                .utcOffset(this.configService.timezoneOffset)
                .month();

        // refactor(roy): optimise
        const appointments = await this.allocationRepository.find({
            where: {
                provider: {
                    dispatcher: {
                        id: providerId,
                    },
                },
                ...status,
            },
        });

        const appointmentsOfMonth = appointments.filter(
            a =>
                +moment
                    .utc(a.provider.schedule.period.start)
                    .clone()
                    .utcOffset(this.configService.timezoneOffset)
                    .month() === +monthOfYear,
        );

        const g = appointmentsOfMonth.reduce((groups, appointment) => {
            const date = moment(appointment.provider.schedule.period.start)
                .clone()
                .utcOffset(this.configService.timezoneOffset);
            const d = date.format('YYYY-MM-DD');

            if (!groups[d]) {
                const dto = new AppointmentSummaryDto();
                dto.date = d;
                dto.totalAllocatedOrCompletedJobs = 0;
                groups[d] = dto;
            }
            groups[d].totalAllocatedOrCompletedJobs += 1;

            return groups;
        }, {});

        return Object.keys(g).map(date => g[date]);
    }
}
