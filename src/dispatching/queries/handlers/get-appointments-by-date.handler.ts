import { IQueryHandler, QueryHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Repository, In } from 'typeorm';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { GetServiceRequestQuery } from '@service-request/queries/get-service-request.query';
import { AppointmentDto } from '../../dto/appointment.dto';
import { Appointment } from '../../entities/appointment.entity';
import { AppointmentStatusEnum } from '../../enums/appointment-status.enum';
import { GetAppointmentsByDateQuery } from '../get-appointments-by-date.query';

@QueryHandler(GetAppointmentsByDateQuery)
export class GetAppointmentsByDateHandler implements IQueryHandler<GetAppointmentsByDateQuery> {
    constructor(@InjectRepository(Appointment) private readonly allocationRepository: Repository<Appointment>, private readonly queryBus: QueryBus) {}

    async execute(query: GetAppointmentsByDateQuery): Promise<AppointmentDto[]> {
        const { providerId } = query;
        let { date } = query;
        const TZ_MY = 8;
        const status = {
            status: In([AppointmentStatusEnum.ALLOCATED, AppointmentStatusEnum.FULFILLED]),
        };

        date =
            date ??
            moment()
                .utcOffset(TZ_MY)
                .format('YYYY-MM-DD');

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

        // refactor(roy): refactor
        const appointmentsOfDate = appointments.filter(
            a =>
                moment
                    .utc(a.provider.schedule.period.start)
                    .clone()
                    .utcOffset(TZ_MY)
                    .format('YYYY-MM-DD') === date,
        );

        const dto = new AppointmentDto();
        dto.date = date;

        dto.serviceRequests = [];
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < appointmentsOfDate.length; i++) {
            const serviceRequest: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(appointmentsOfDate[i].serviceRequestId));
            dto.serviceRequests.push(serviceRequest.toDto());
        }

        // refactor(roy): refactor
        // const g = appointmentsOfMonth.reduce((groups, appointment) => {
        //     const date = moment(appointment.provider.schedule.period.start).clone().utcOffset(8);
        //     const d = date.format('YYYY-MM-DD');

        //     if (!groups[d]) {
        //         dto.date = d;
        //         dto.totalAllocatedOrCompletedJobs = 0;
        //         groups[d] = dto;
        //     }
        //     groups[d].totalAllocatedOrCompletedJobs += 1;

        //     return groups;
        // }, {});

        return [dto];
    }
}
