import { Injectable } from '@nestjs/common';
import { AppConfigService } from '@shared/config';
import { Period } from '@shared/entities/period.entity';
import { Appointment } from '../appointment.entity';

@Injectable()
export class AppointmentFactory {
    constructor(private readonly configService: AppConfigService) {}

    public create(expectedArrivalPeriod: Period, totalServiceMinutes: number, now: Date): Appointment {
        return new Appointment(
            expectedArrivalPeriod,
            totalServiceMinutes,
            this.configService.serviceRequestExpectedArrivalWindowHour,
            this.configService.blockBeforeInMinutes,
            this.configService.blockAfterInMinutes,
            this.configService.timezoneOffset,
            now,
        );
    }
}
