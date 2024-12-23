import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository, getCustomRepository } from 'typeorm';
import { ServiceRequest } from '@service-request/entities/service-request.entity';
import { HandlingEventInput } from './dto/handling-event.input';
import { HandlingEvent } from './entities/handling-event.entity';
import { HandlingEventFactory } from './entities/handling-event.factory';
import { HandlingHistory } from './entities/handling-history.entity';
import { HandlingEventRepository } from './repository/handling-event.repository';

// refactor(roy): delete this file, duplicated as commands/handle-servicing-job.command.ts
@Injectable()
export class HandlingService extends TypeOrmCrudService<HandlingEvent> {
    constructor(
        @InjectRepository(HandlingEvent) private readonly repository: Repository<HandlingEvent>,
        @InjectRepository(ServiceRequest) private readonly serviceRequestRepo: Repository<ServiceRequest>,
        @Inject(HandlingEventFactory) private readonly handlingEventFactory: HandlingEventFactory,
    ) {
        super(repository);
    }

    async create(input: HandlingEventInput): Promise<HandlingEvent> {
        const handlingEventRepo = getCustomRepository(HandlingEventRepository);

        const he = await this.handlingEventFactory.create(input);
        await handlingEventRepo.save(he);

        const history: HandlingHistory = await handlingEventRepo.lookupHandlingHistoryOfServiceRequest(he.serviceRequestId);
        const serviceRequest = await this.serviceRequestRepo.findOne(he.serviceRequestId);
        serviceRequest.deriveServiceProgress(history);
        serviceRequest.beforeSave();
        await this.serviceRequestRepo.save(serviceRequest);
        return he;
    }
}
