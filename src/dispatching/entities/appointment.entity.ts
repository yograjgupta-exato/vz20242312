import { Entity, Column, DeepPartial } from 'typeorm';
import { AbstractEntity } from '@shared/entities/abstract.entity';
import { OptPeriod } from '@shared/entities/opt-period.entity';
import { AppointmentStatusEnum } from '../enums/appointment-status.enum';
import { Provider } from './provider.entity';

@Entity({
    name: 'appointments',
})
export class Appointment extends AbstractEntity {
    constructor(input?: DeepPartial<Appointment>) {
        super(input);
    }

    @Column(() => Provider)
    provider: Provider;

    @Column()
    serviceRequestId: string;

    @Column()
    status: AppointmentStatusEnum;

    public serviceSchedule(): OptPeriod {
        return this.provider?.schedule?.period;
    }
}
