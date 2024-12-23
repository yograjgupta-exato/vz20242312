import { Injectable } from '@nestjs/common';
import { OData } from 'odata-client';
import { AppConfigService } from '@shared/config';
import { CRMCompetitorEquipmentEndpoint } from './crm-competitor-equipment.endpoint';
import { CRMCustomerEndpoint } from './crm-customer.endpoint';
import { CRMEquipmentEndpoint } from './crm-equipment.endpoint';
import { CRMProductEndpoint } from './crm-product.endpoint';
import { CRMServiceRequestEndpoint } from './crm-service-request.endpoint';

// design pattern: abstract-factory to logically group a family
// of endpoints: service - request, product, competitor, etc...
@Injectable()
export class CRMApiFactory {
    constructor(private readonly configService: AppConfigService) {}

    private getODataClientInstance(endpointPath: string) {
        const crmOptions = this.configService.crmOptions;
        return OData.New({
            metadataUri: crmOptions.apiServerUrl + endpointPath,
            credential: {
                username: crmOptions.username,
                password: crmOptions.password,
            },
        });
    }

    createServiceRequestEndpoint(): CRMServiceRequestEndpoint {
        return new CRMServiceRequestEndpoint(this.getODataClientInstance(this.configService.crmOptions.apiServiceRequestEndpointPath));
    }

    createCompetitorEndpoint(): CRMCompetitorEquipmentEndpoint {
        return new CRMCompetitorEquipmentEndpoint(this.getODataClientInstance(this.configService.crmOptions.apiCompetitorEqEndpointPath));
    }

    createCustomerEndpoint(): CRMCustomerEndpoint {
        return new CRMCustomerEndpoint(this.getODataClientInstance(this.configService.crmOptions.apiServiceRequestEndpointPath));
    }

    createProductEndpoint(): CRMProductEndpoint {
        return new CRMProductEndpoint(this.getODataClientInstance(this.configService.crmOptions.apiServiceRequestEndpointPath));
    }

    createEquipmentEndpoint(): CRMEquipmentEndpoint {
        return new CRMEquipmentEndpoint(this.getODataClientInstance(this.configService.crmOptions.apiEquipmentEndpointPath));
    }
}
