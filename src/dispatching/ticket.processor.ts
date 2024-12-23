import { Process, Processor, InjectQueue } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { EventBus, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Job, Queue } from 'bull';
import { Repository } from 'typeorm';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { GetServiceRequestQuery } from '@service-request/queries/get-service-request.query';
import { AssignmentInput } from './dto/assignment.input';
import { JobDtoFactory } from './dto/factories/job.dto.factory';
import { Assignment } from './entities/assignment.entity';
import { BatchWise } from './entities/batch-wise.entity';
import { AssignmentFactory } from './entities/factories/assignment.factory';
import { SendToAll } from './entities/send-to-all.entity';
import { AutoAssignmentTypeEnum } from './enums/auto-assignment-type.enum';
import { JobDispatchedToProviderEvent } from './events/job-dispatched-to-provider.event';
import { IServiceProvider } from 'service-provider/interfaces/service-provider.interface';
import { ScanCandidatesQuery } from 'service-provider/queries/scan-candidates.query';
import { ServiceProvider } from 'service-provider/service-provider.entity';

@Processor('ticket')
export class TicketProcessor {
    constructor(
        @InjectRepository(Assignment) private readonly assignmentRepository: Repository<Assignment>,
        private readonly eventBus: EventBus,
        private readonly queryBus: QueryBus,
        @InjectRepository(ServiceProvider) private readonly serviceProviderRepository: Repository<ServiceProvider>,
        @InjectQueue('ticket') private readonly ticketQueue: Queue,
    ) {}
    private readonly logger = new Logger(TicketProcessor.name);

    @Process('assign')
    async handleAllocation(job: Job) {
        // refactor(roy): to factory
        const autoAllocationType = job.data.autoAllocation.type;
        const scanningZoneType = job.data.autoAllocation.scanningZoneType;

        try {
            if (autoAllocationType === AutoAssignmentTypeEnum.SEND_TO_ALL) {
                const sendToAll = job.data.autoAllocation.sendToAll as SendToAll;

                this.logger.log('Processing Send To All Dispatch Strategy...');
                this.logger.log(`Processing Service-Request: ${job.data.serviceTicketId}...`);

                const serviceTicket: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(job.data.serviceTicketId));
                if (!serviceTicket) {
                    this.logger.error(`service ticket not found: ${job.data.serviceTicketId}...`);
                    return;
                }

                if (serviceTicket.hasBeenAssignedOrAllocated()) {
                    this.logger.log(`exit: service ticket: ${job.data.serviceTicketId} has been assigned.`);
                    return;
                }

                this.logger.log('Scanning All providers');

                const serviceProviders: IServiceProvider[] = await this.queryBus.execute(
                    new ScanCandidatesQuery(
                        scanningZoneType,
                        serviceTicket.getCustomerAddressLatLng(),
                        serviceTicket.toDto().customerAddress.postalCode,
                        [],
                        serviceTicket.getEntitlement(),
                    ),
                );

                this.logger.log(`${serviceProviders.length} providers found...`);

                const requestSeconds = serviceTicket.secondsTillServiceScheduledDate() || sendToAll.requestSeconds;
                const promises = serviceProviders.map(async sp => {
                    const di = new AssignmentInput();
                    di.providerId = sp.getId();
                    di.requestSeconds = requestSeconds;
                    di.serviceRequestId = serviceTicket.getId();
                    di.assignmentType = autoAllocationType;
                    di.scanningZoneType = scanningZoneType;

                    const assignment = AssignmentFactory.create(di);
                    this.logger.log(`Auto-assign to Provider(${sp.getId()}): ${sp.getName()}...`);
                    const d = await this.assignmentRepository.save(assignment);
                    return this.eventBus.publish(
                        new JobDispatchedToProviderEvent(d.id, JobDtoFactory.create(serviceTicket, requestSeconds), sp.getId()),
                    );
                });
                await Promise.all(promises);

                this.logger.log('exit: All provider has been assigned...');
            } else {
                const batchWise = job.data.autoAllocation.batchWise as BatchWise;

                const state = job.data.state;
                if (!state.dispatched) {
                    state.dispatched = [];
                }
                if (!state.currentBatchNo) {
                    state.currentBatchNo = 1;
                }
                if (state.currentBatchNo > batchWise.batchLimit.size) {
                    this.logger.log(`exit: All ${batchWise.batchLimit.size} batches has been assigned...`);
                    return true;
                }

                this.logger.log(`Processing Batch Number: ${state.currentBatchNo}...`);
                this.logger.log(`Processing Service-Request: ${job.data.serviceTicketId}...`);

                const serviceTicket: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(job.data.serviceTicketId));
                if (!serviceTicket) {
                    this.logger.error(`service ticket not found: ${job.data.serviceTicketId}...`);
                    return;
                }
                if (serviceTicket.hasBeenAssignedOrAllocated()) {
                    this.logger.log(`exit: service ticket: ${job.data.serviceTicketId} has been assigned.`);
                    return;
                }

                this.logger.log(`Scanning nearby N providers, N=${batchWise.batchLimit.maxAgents}`);
                const serviceProviders: IServiceProvider[] = await this.queryBus.execute(
                    new ScanCandidatesQuery(
                        scanningZoneType,
                        serviceTicket.getCustomerAddressLatLng(),
                        serviceTicket.toDto().customerAddress.postalCode,
                        state.dispatched,
                        serviceTicket.getEntitlement(),
                        batchWise.batchLimit.maxAgents,
                    ),
                );

                this.logger.log(`${serviceProviders.length} providers found...`);

                const promises = serviceProviders.map(async sp => {
                    state.dispatched.push(sp.getId());
                    // refactor(roy): to factory
                    const di = new AssignmentInput();
                    di.providerId = sp.getId();
                    di.requestSeconds = batchWise.durationSetting.requestSeconds;
                    di.serviceRequestId = serviceTicket.getId();
                    di.assignmentType = autoAllocationType;
                    di.scanningZoneType = scanningZoneType;

                    const assignment = AssignmentFactory.create(di);
                    this.logger.log(`Auto-assign to Provider(${sp.getId()}): ${sp.getName()}...`);
                    const d = await this.assignmentRepository.save(assignment);
                    return this.eventBus.publish(
                        new JobDispatchedToProviderEvent(
                            d.id,
                            JobDtoFactory.create(serviceTicket, batchWise.durationSetting.requestSeconds),
                            sp.getId(),
                        ),
                    );
                });
                await Promise.all(promises);

                // todo(roy): expires ticket
                if (state.currentBatchNo++ >= batchWise.batchLimit.size) {
                    this.logger.log(`exit: All ${batchWise.batchLimit.size} batches has been assigned...`);
                    return;
                }

                job.data.state = state;
                this.logger.log(`Processing Next Batch in ${batchWise.durationSetting.batchProcessingSeconds} seconds...`);
                await this.ticketQueue.add(
                    'assign',
                    job.data,
                    { delay: batchWise.durationSetting.batchProcessingSeconds * 1000 }, // 10 seconds delayed
                );
            }
        } catch (err) {
            this.logger.error(err);
        }
    }
}
