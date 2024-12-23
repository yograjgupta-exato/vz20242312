import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler, EventBus, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getCustomRepository } from 'typeorm';
import { ServiceRequestFulfilledEvent, ServiceRequestStartedEvent, ServiceRequestWorkCommencedEvent } from '@cqrs/events/service-request.event';
import { EntityNotFoundError, TechnicalReportNotCompletedError, JobStartTooEarlyError, IncorrectVerificationCodeError } from '@shared/errors';
import { ServiceRequest } from '@service-request/entities/service-request.entity';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { GetServiceRequestQuery } from '@service-request/queries/get-service-request.query';
import { isDevMode } from '../../../app.environment';
import { HandlingEvent } from '../../entities/handling-event.entity';
import { HandlingEventFactory } from '../../entities/handling-event.factory';
import { HandlingHistory } from '../../entities/handling-history.entity';
import { HandlingEventTypeEnum } from '../../enums/handling-event-type.enum';
import { HandlingEventRepository } from '../../repository/handling-event.repository';
import { HandleServicingJobCommand } from '../handle-servicing-job.command';

@CommandHandler(HandleServicingJobCommand)
export class HandleServicingJobHandler implements ICommandHandler<HandleServicingJobCommand> {
    constructor(
        private readonly eventBus: EventBus,
        private readonly queryBus: QueryBus,
        @InjectRepository(HandlingEvent) private readonly repository: Repository<HandlingEvent>,
        @InjectRepository(ServiceRequest) private readonly serviceRequestRepo: Repository<ServiceRequest>,
        @Inject(HandlingEventFactory) private readonly handlingEventFactory: HandlingEventFactory,
    ) {}

    async execute(command: HandleServicingJobCommand): Promise<IServiceRequest> {
        const { input } = command;

        const handlingEventRepo = getCustomRepository(HandlingEventRepository);
        const serviceRequest: IServiceRequest = await this.serviceRequestRepo.findOne(input.serviceRequestId);
        if (!serviceRequest) {
            throw new EntityNotFoundError('ServiceRequest', input.serviceRequestId);
        }

        if (!serviceRequest.hasSurpassedHourLimitBeforeJobIsAllowedToStart()) {
            throw new JobStartTooEarlyError(serviceRequest.getConfig().hourLimitBeforeJobIsAllowedToStart);
        }

        input.type = serviceRequest.nextHandlingEventType(); // refactor(roy): should i remove handling-event-type from input?

        if (input.type === HandlingEventTypeEnum.FULLFIL) {
            if (String(input.verificationCode) !== serviceRequest.getVerificationCode()) {
                if (!isDevMode || String(input.verificationCode) !== '99999') {
                    throw new IncorrectVerificationCodeError();
                }
            }

            if (!serviceRequest.haveCompletedAllTechnicalReports()) {
                throw new TechnicalReportNotCompletedError();
            }
        }

        const he = await this.handlingEventFactory.create(input);
        await handlingEventRepo.save(he);

        const history: HandlingHistory = await handlingEventRepo.lookupHandlingHistoryOfServiceRequest(he.serviceRequestId);
        serviceRequest.deriveServiceProgress(history);
        serviceRequest.beforeSave();
        let sr = await this.serviceRequestRepo.save(serviceRequest);

        // note(roy): refetch service-request obj to overcome serviceRequest.beforeSave() that deletes service-packages.
        sr = await this.queryBus.execute(new GetServiceRequestQuery(serviceRequest.getId()));
        if (input.type === HandlingEventTypeEnum.START) {
            this.eventBus.publish(new ServiceRequestStartedEvent(sr));
        }

        if (input.type === HandlingEventTypeEnum.IN_PROGRESS) {
            this.eventBus.publish(new ServiceRequestWorkCommencedEvent(sr));
        }

        if (sr.hasBeenFulfilled()) {
            this.eventBus.publish(new ServiceRequestFulfilledEvent(sr));
        }

        return sr;
    }
}
