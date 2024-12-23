import { ApiProperty, IntersectionType, OmitType } from '@nestjs/swagger';
import { Appointment } from '@service-request/entities/appointment.entity';
import { ExpectedArrivalPeriodDto } from './expected-arrival-period.dto';

class AdditionalAppointmentInfo {
    @ApiProperty()
    expectedArrivalPeriod: ExpectedArrivalPeriodDto;
}

export class AppointmentDto extends IntersectionType(OmitType(Appointment, ['expectedArrivalPeriod'] as const), AdditionalAppointmentInfo) {
    constructor(appointment: Appointment) {
        super();
        this.blockAfterInMinutes = appointment.blockAfterInMinutes;
        this.blockBeforeInMinutes = appointment.blockBeforeInMinutes;
        this.expectedArrivalPeriod = new ExpectedArrivalPeriodDto(appointment.expectedArrivalPeriod);
        this.serviceSchedule = appointment.serviceSchedule;
        this.totalServiceMinutes = appointment.totalServiceMinutes;
    }
}
