import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityNotFoundError } from '@shared/errors';
import { ServiceRequest } from '@service-request/entities/service-request.entity';
import { HandlingEvent } from './handling-event.entity';
import { HandlingEventInput } from 'handling/dto/handling-event.input';

@Injectable()
export class HandlingEventFactory {
    constructor(
        // refactor(roy): use queryBus for cross-module communication.
        @InjectRepository(ServiceRequest) private readonly serviceRequestRepo: Repository<ServiceRequest>,
    ) {}

    public async create(input: HandlingEventInput) {
        const { latitude, longitude, providerWorkerId, serviceRequestId, type } = input;

        const sr = await this.serviceRequestRepo.findOne(serviceRequestId);
        if (!sr) {
            throw new EntityNotFoundError('ServiceRequest', serviceRequestId);
        }
        if (false && sr.service?.provider?.worker?.id !== providerWorkerId) {
            throw new Error(`handling: service not allocated to worker: ${providerWorkerId}`);
        }
        // refactor(roy): add validation for sr.service.status

        const he = new HandlingEvent();
        he.latitude = latitude;
        he.longitude = longitude;
        he.providerWorkerId = providerWorkerId;
        he.serviceRequestId = serviceRequestId;
        he.type = type;

        return he;
    }
}
