import { Injectable, Logger } from '@nestjs/common';
import { EventBus, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { CrudRequest, Override } from '@nestjsx/crud';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { TYPEORM_DUPLICATE_KEY_VALUE_VIOLATES_UNIQUE_CONSTRAINT_ERROR_CODE } from '@shared/constants';
import { EntityNotFoundError, EquipmentSerialNumberAlreadyRegisteredError, ServiceRequestNotAssignedError } from '@shared/errors';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { GetServiceRequestQuery } from '@service-request/queries/get-service-request.query';
import { IServiceProvider } from '@service-provider/interfaces/service-provider.interface';
import { GetServiceProviderQuery } from '@service-provider/queries';
import { CreateEquipmentInput } from './equipment.dto';
import { Equipment } from './equipment.entity';
import { EquipmentCreatedEvent } from './events/equipment.event';

@Injectable()
export class EquipmentService extends TypeOrmCrudService<Equipment> {
    constructor(
        private readonly eventBus: EventBus,
        private readonly queryBus: QueryBus,
        @InjectRepository(Equipment) private readonly repository: Repository<Equipment>,
    ) {
        super(repository);
    }
    private readonly logger = new Logger(EquipmentService.name);

    @Override()
    async createOne(req: CrudRequest, input: CreateEquipmentInput): Promise<Equipment> {
        let equipment = null;

        const serviceRequest: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(input.serviceRequestId));
        if (!serviceRequest) {
            throw new EntityNotFoundError('ServiceRequest', input.serviceRequestId);
        }

        if (!serviceRequest.getCRMCustomerId()) {
            this.logger.warn(
                `Missing 'CRMCustomerId' while registering equipment with serial number: '${
                    input.serialNumber
                }' to service-request: '${serviceRequest.getId()}'`,
            );
        }

        if (!serviceRequest.hasBeenAssignedOrAllocated()) {
            throw new ServiceRequestNotAssignedError(serviceRequest.getId());
        }

        const dealerId = serviceRequest.getServiceProvider()?.dispatcher?.id;
        const dealer: IServiceProvider = await this.queryBus.execute(new GetServiceProviderQuery(dealerId));
        if (!dealer) {
            throw new EntityNotFoundError('ServiceProvider', dealerId);
        }

        try {
            equipment = await this.repository.save({
                ...input,
                crmCustomerId: serviceRequest.getCRMCustomerId(),
                providerId: serviceRequest.getServiceProvider()?.dispatcher?.id,
                providerVendorId: dealer.getVendorId(),
            } as Equipment);
        } catch (err) {
            if (err?.code === TYPEORM_DUPLICATE_KEY_VALUE_VIOLATES_UNIQUE_CONSTRAINT_ERROR_CODE) {
                throw new EquipmentSerialNumberAlreadyRegisteredError(input.serialNumber);
            }
            throw err;
        }

        this.eventBus.publish(new EquipmentCreatedEvent(equipment));
        return equipment;
    }
}
