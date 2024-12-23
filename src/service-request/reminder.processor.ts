import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Job } from 'bull';
import * as moment from 'moment';
import { ServiceRequestDto } from '@service-request/dto/service-request.dto';
import { PushNotifyScheduledJobReminderCommand } from '../push-notification/commands/push-notify-scheduled-job-reminder.command';
import { IServiceRequest } from './interfaces/service-request.interface';
import { GetServiceRequestQuery } from './queries/get-service-request.query';

@Processor('reminder')
export class ReminderProcessor {
    constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

    private readonly logger = new Logger(ReminderProcessor.name);

    @Process('remind')
    async handleReminder(job: Job) {
        try {
            if (!job?.data?.serviceRequestDto) {
                throw new Error('Job data is missing');
            }

            const cachedServiceRequestDto = job.data.serviceRequestDto as ServiceRequestDto;
            const serviceRequest: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(cachedServiceRequestDto.id));
            await this.process(cachedServiceRequestDto, serviceRequest);
        } catch (err) {
            this.logger.error(err);
            throw err;
        }
    }

    async process(cachedServiceRequestDto: ServiceRequestDto, serviceRequest: IServiceRequest) {
        const hasAppointmentStartTimeChanged =
            moment
                .utc(cachedServiceRequestDto.appointment.serviceSchedule.start)
                .diff(moment.utc(serviceRequest.toDto().appointment.serviceSchedule.start)) > 0;

        if (hasAppointmentStartTimeChanged) {
            throw new Error('Appointment start time has been changed');
        }

        const countDownTillServiceStartInSeconds = moment.utc(serviceRequest.serviceSchedule().start).diff(moment().utc(), 'seconds');
        if (countDownTillServiceStartInSeconds < 1) {
            this.logger.warn(`Service Request: '${serviceRequest.getId()}' already past reminder period`);
            return;
        }

        if (!serviceRequest.hasBeenAssignedOrAllocated()) {
            this.logger.warn(`Service Request: '${serviceRequest.getId()}' has not been assigned yet`);
            return;
        }

        const dispatcherId = serviceRequest.getServiceProvider().dispatcher.id;
        const workerId = serviceRequest.getServiceProvider().worker.id;
        await this.commandBus.execute(
            new PushNotifyScheduledJobReminderCommand(dispatcherId, cachedServiceRequestDto, countDownTillServiceStartInSeconds),
        );

        if (!workerId || workerId === dispatcherId) {
            return;
        }

        await this.commandBus.execute(
            new PushNotifyScheduledJobReminderCommand(workerId, cachedServiceRequestDto, countDownTillServiceStartInSeconds),
        );
    }
}
