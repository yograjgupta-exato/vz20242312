import { Repository, EntityRepository, Brackets } from 'typeorm';
import { Period } from '@shared/entities/period.entity';
import { IServiceProvider } from '../../service-provider/interfaces/service-provider.interface';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentStatusEnum } from '../enums/appointment-status.enum';

@EntityRepository(Appointment)
export class AppointmentRepository extends Repository<Appointment> {
    async findOverlappingAllocatedAppointmentsOfWorkers(workers: IServiceProvider[], schedule: Period): Promise<Appointment[]> {
        const query = this.createQueryBuilder('appointment')
            .distinctOn(['appointment.provider_worker_id'])
            .where('appointment.status = :status', { status: AppointmentStatusEnum.ALLOCATED })
            .andWhere(
                new Brackets(qb => {
                    qb.where(
                        'appointment.provider_schedule_period_start <= :scheduleStart AND appointment.provider_schedule_period_end >= :scheduleStart',
                        { scheduleStart: schedule.start.toISOString() },
                    ).orWhere(
                        'appointment.provider_schedule_period_start <= :scheduleEnd AND appointment.provider_schedule_period_end >= :scheduleEnd',
                        { scheduleEnd: schedule.end.toISOString() },
                    );
                }),
            );

        if (workers.length) {
            query.andWhere('appointment.provider_worker_id IN (:...workerIds)', { workerIds: workers.map(w => w.getId()) });
        }

        return query.getMany();
    }
}
