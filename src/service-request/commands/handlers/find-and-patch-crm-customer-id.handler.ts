import { Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceRequestReadyForCRMEvent } from '@cqrs/events/service-request.event';
import { EntityNotFoundError } from '@shared/errors';
import { ServiceRequest } from '@service-request/entities/service-request.entity';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { GetServiceRequestQuery } from '@service-request/queries/get-service-request.query';
import { CRMCustomerMappingKeys } from '../../../crm/dtos/crm-customer.dto';
import { FindAndPatchCRMCustomerIdCommand } from '../find-and-patch-crm-customer-id.command';
import { CRMService } from 'crm/crm.service';
import { CreateCRMCustomerInput } from 'crm/inputs/create-crm-customer.input';

@CommandHandler(FindAndPatchCRMCustomerIdCommand)
export class FindAndPatchCRMCustomerIdHandler implements ICommandHandler<FindAndPatchCRMCustomerIdCommand> {
    constructor(
        private readonly crmService: CRMService,
        private readonly eventBus: EventBus,
        private readonly queryBus: QueryBus,
        @InjectRepository(ServiceRequest) private readonly repository: Repository<ServiceRequest>,
    ) { }
    private readonly logger = new Logger(FindAndPatchCRMCustomerIdHandler.name);

    async execute(command: FindAndPatchCRMCustomerIdCommand): Promise<void> {
        if (!this.crmService.isEnabled) {
            return;
        }

        this.logger.log('FindAndPatchCRMCustomerIdCommand');

        const { serviceRequestId } = command;
        const serviceRequest: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(serviceRequestId));
        if (!serviceRequest) {
            throw new EntityNotFoundError('ServiceRequest', serviceRequestId);
        }
        const crmCustomer = await this.crmService.createCustomerIfNotExist(CreateCRMCustomerInput.fromServiceRequest(serviceRequest));

        if (crmCustomer[CRMCustomerMappingKeys.CustomerID]) {
            serviceRequest.changeCRMCustomerId(crmCustomer[CRMCustomerMappingKeys.CustomerID]);
            serviceRequest.beforeSave();
            await this.repository.save(serviceRequest);
            this.eventBus.publish(new ServiceRequestReadyForCRMEvent(serviceRequest));
        } else {
            this.logger.error('Error patching CRM customer Id to service request', serviceRequestId);
        }
    }
}
