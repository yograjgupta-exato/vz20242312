import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import * as moment from 'moment';
import { EntityNotFoundError } from '@shared/errors';
import { substringTrimIfNotNull } from '@shared/utils/formatter';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { GetServiceRequestQuery } from '@service-request/queries/get-service-request.query';
import { IServiceRequest as ICRMServiceRequest } from '../../crm.interface';
import { CreateCRMServiceRequestCommand } from '../create-crm-service-request.command';
import { ProcessingTypeCode, ServiceCategoryID, ServiceRequestMappingKeys } from 'crm/crm.enum';
import { CRMService } from 'crm/crm.service';

@CommandHandler(CreateCRMServiceRequestCommand)
export class CreateCRMServiceRequestHandler implements ICommandHandler<CreateCRMServiceRequestCommand> {
    constructor(private readonly crmService: CRMService, private readonly queryBus: QueryBus) {}
    private readonly logger = new Logger(CreateCRMServiceRequestHandler.name);

    async execute(command: CreateCRMServiceRequestCommand): Promise<void> {
        const { serviceRequestId } = command;
        const serviceRequest: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(serviceRequestId));
        if (!serviceRequest) {
            throw new EntityNotFoundError('ServiceRequest', serviceRequestId);
        }
        const dto = serviceRequest.toDto();

        const expectedArrivalPeriod = dto.appointment.expectedArrivalPeriod;
        const address = dto.customerAddress;
        const contact = dto.customerContact;
        const crmServiceRequest: ICRMServiceRequest = {
            Name: `Service Ticket #${dto.id}`,
            ProcessingTypeCode: ProcessingTypeCode[dto.principalGroup],
            ServiceIssueCategoryID: ServiceCategoryID[dto.principalGroup],
            ProductID: '', // TODO: ProductID
            [ServiceRequestMappingKeys.id]: dto.id,
            [ServiceRequestMappingKeys.bookingDate]: `/Date(${new Date().getTime()})/`,
            [ServiceRequestMappingKeys.bookingTime]: moment()
                .utc()
                .utcOffset(8)
                .format('hh:mm A'),
            [ServiceRequestMappingKeys.appointmentDate]: `/Date(${new Date(expectedArrivalPeriod.formattedDate).getTime()})/`,
            [ServiceRequestMappingKeys.appointmentTime]: expectedArrivalPeriod.formattedTime,
            [ServiceRequestMappingKeys.serviceType]: '', // TODO: ServiceType
            [ServiceRequestMappingKeys.endConsumerC4CID]: dto.crmCustomerId,
            [ServiceRequestMappingKeys.addressPropertyType]: address.propertyType,
            [ServiceRequestMappingKeys.addressBuilding]: substringTrimIfNotNull(address.building, 0, 40),
            [ServiceRequestMappingKeys.addressCompany]: substringTrimIfNotNull(address.company, 0, 120),
            [ServiceRequestMappingKeys.addressCity]: substringTrimIfNotNull(address.city, 0, 40),
            [ServiceRequestMappingKeys.addressCountryCode]: substringTrimIfNotNull(address.countryCode, 0, 40),
            [ServiceRequestMappingKeys.addressLat]: String(address.latitude),
            [ServiceRequestMappingKeys.addressLng]: String(address.longitude),
            [ServiceRequestMappingKeys.addressState]: substringTrimIfNotNull(address.state, 0, 40),
            [ServiceRequestMappingKeys.addressStreet1]: substringTrimIfNotNull(address.street1, 0, 120),
            [ServiceRequestMappingKeys.addressStreet2]: substringTrimIfNotNull(address.street2, 0, 120),
            [ServiceRequestMappingKeys.addressPostalCode]: substringTrimIfNotNull(address.postalCode, 0, 40),
            [ServiceRequestMappingKeys.contactEmail]: substringTrimIfNotNull(contact.email, 0, 120),
            [ServiceRequestMappingKeys.contactName]: substringTrimIfNotNull(contact.name, 0, 120),
            [ServiceRequestMappingKeys.contactPhone]: substringTrimIfNotNull(contact.phone, 0, 40),
            [ServiceRequestMappingKeys.contactSecondaryPhone]: substringTrimIfNotNull(contact.secondaryPhone, 0, 40),
        };

        await this.crmService.createServiceRequest(crmServiceRequest);
        this.logger.log(crmServiceRequest, 'ServiceRequestCreatedEvent');
    }
}
