import { InjectQueue } from '@nestjs/bull';
import { ICommandHandler, CommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { Repository } from 'typeorm';
import { ServiceRequest } from '../../../service-request/entities/service-request.entity';
import { IServiceRequest } from '../../../service-request/interfaces/service-request.interface';
import { GetServiceRequestQuery } from '../../../service-request/queries/get-service-request.query';
import { InitiateAutoAssignmentCommand } from '../initiate-auto-assignment.command';
import { AutoAssignmentSetting } from 'dispatching/entities/auto-assignment-setting.entity';

@CommandHandler(InitiateAutoAssignmentCommand)
export class InitiateAutoAssignmentHandler implements ICommandHandler<InitiateAutoAssignmentCommand> {
    constructor(
        private readonly queryBus: QueryBus,
        @InjectRepository(AutoAssignmentSetting) private readonly autoAssignmentSettingRepository: Repository<AutoAssignmentSetting>,
        @InjectQueue('ticket') private readonly ticketQueue: Queue,
        @InjectRepository(ServiceRequest) private readonly serviceRequestRepository: Repository<ServiceRequest>,
    ) { }

    async execute(command: InitiateAutoAssignmentCommand): Promise<void> {
        const { serviceRequestId } = command;
        const [autoAssignmentSetting] = await this.autoAssignmentSettingRepository.find();

        const serviceRequest: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(serviceRequestId));
        if (!serviceRequest) {
            return;
        }
        serviceRequest.restart();
        serviceRequest.beforeSave();
        await this.serviceRequestRepository.save(serviceRequest);

        await this.ticketQueue.add(
            'assign',
            {
                autoAllocation: {
                    type: autoAssignmentSetting.autoAssignmentType,
                    scanningZoneType: autoAssignmentSetting.scanningZoneType,
                    batchWise: autoAssignmentSetting.batchWise,
                    sendToAll: autoAssignmentSetting.sendToAll,
                },
                serviceTicketId: serviceRequestId,
                state: {},
            },
            { delay: 1000 },
        );
    }
}
