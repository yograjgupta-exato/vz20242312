import { ServiceRequestMappingKeys } from './crm.enum';

export interface IServiceRequest {
    Name: string;
    ProcessingTypeCode: string;
    ServiceIssueCategoryID: string;
    ProductID: string;
    [ServiceRequestMappingKeys.id]: string;
    [ServiceRequestMappingKeys.bookingDate]: string;
    [ServiceRequestMappingKeys.bookingTime]: string;
    [ServiceRequestMappingKeys.appointmentDate]: string;
    [ServiceRequestMappingKeys.appointmentTime]: string;
    [ServiceRequestMappingKeys.serviceType]: string;
    [ServiceRequestMappingKeys.endConsumerC4CID]: string;
    [ServiceRequestMappingKeys.addressPropertyType]: string;
    [ServiceRequestMappingKeys.addressBuilding]: string;
    [ServiceRequestMappingKeys.addressCompany]: string;
    [ServiceRequestMappingKeys.addressCity]: string;
    [ServiceRequestMappingKeys.addressCountryCode]: string;
    [ServiceRequestMappingKeys.addressLat]: string;
    [ServiceRequestMappingKeys.addressLng]: string;
    [ServiceRequestMappingKeys.addressState]: string;
    [ServiceRequestMappingKeys.addressStreet1]: string;
    [ServiceRequestMappingKeys.addressStreet2]: string;
    [ServiceRequestMappingKeys.addressPostalCode]: string;
    [ServiceRequestMappingKeys.contactEmail]: string;
    [ServiceRequestMappingKeys.contactName]: string;
    [ServiceRequestMappingKeys.contactPhone]: string;
    [ServiceRequestMappingKeys.contactSecondaryPhone]: string;
}

export interface IProduct {
    ProductID: string;
    Description: string;
    BaseUOM: string;
    ProductCategoryID: string;
}
