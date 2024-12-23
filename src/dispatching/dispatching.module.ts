import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Redis from 'ioredis';
import { AppConfigService } from '@shared/config';
import { ServiceRequest } from '@service-request/entities/service-request.entity';
import { AppointmentController } from './appointment.controller';
import { AutoAssignmentSettingController } from './auto-assignment-setting.controller';
import { AutoAssignmentSettingService } from './auto-assignment-setting.service';
import { CommandHandlers } from './commands/handlers';
import { Appointment } from './entities/appointment.entity';
import { Assignment } from './entities/assignment.entity';
import { AutoAssignmentSetting } from './entities/auto-assignment-setting.entity';
import { EventHandlers } from './events/handlers';
import { JobController } from './job.controller';
import { QueryHandlers } from './queries';
import { AssignmentSaga } from './sagas/assignment.saga';
import { TicketProcessor } from './ticket.processor';
import { ServiceProvider } from 'service-provider/service-provider.entity';

@Module({
    imports: [
        BullModule.registerQueueAsync({
            name: 'ticket',
            useFactory: (configService: AppConfigService) => ({
                prefix: '{queue}',
                defaultJobOptions: {
                    attempts: 10,
                    removeOnComplete: true,
                    removeOnFail: true,
                },
                createClient: () =>
                    configService.dispatchQueueOptions.redisClusterMode
                        ? new Redis.Cluster(
                              [
                                  {
                                      host: configService.dispatchQueueOptions.redisHost,
                                      port: configService.dispatchQueueOptions.redisPort,
                                  },
                              ],
                              {
                                  enableReadyCheck: true,
                              },
                          )
                        : new Redis(configService.dispatchQueueOptions.redisPort, configService.dispatchQueueOptions.redisHost),
            }),
            inject: [AppConfigService],
        }),
        CqrsModule,
        TypeOrmModule.forFeature([Appointment]),
        TypeOrmModule.forFeature([AutoAssignmentSetting]),
        TypeOrmModule.forFeature([Assignment]),
        TypeOrmModule.forFeature([ServiceRequest]),
        TypeOrmModule.forFeature([ServiceProvider]),
    ],
    controllers: [AppointmentController, AutoAssignmentSettingController, JobController],
    providers: [AssignmentSaga, AutoAssignmentSettingService, ...CommandHandlers, ...EventHandlers, ...QueryHandlers, TicketProcessor],
})
export class DispatchingModule {}
