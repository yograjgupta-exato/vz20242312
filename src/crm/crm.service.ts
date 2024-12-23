import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '@shared/config';
import { CRMApiFactory } from './apis/crm-api.factory';
import { IProduct, IServiceRequest } from './crm.interface';
import { CRMCompetitorEquipmentDto } from './dtos/crm-competitor-equipment.dto';
import { CRMCustomerDto } from './dtos/crm-customer.dto';
import { CRMEquipmentDto } from './dtos/crm-equipment.dto';
import { CreateCRMCustomerInput } from './inputs/create-crm-customer.input';
import { RegisterCrmWarrantyEquipmentsInput } from './inputs/register-crm-warranty-equipments.input';

@Injectable()
export class CRMService {
    readonly isEnabled: boolean = false;
    private readonly logger = new Logger(CRMService.name);

    constructor(private readonly appConfig: AppConfigService, private readonly apiFactory: CRMApiFactory) {
        const crmOptions = this.appConfig.crmOptions;
        this.isEnabled = crmOptions.isEnabled;
        if (!this.isEnabled) {
            this.logger.warn('CRMService:: CrmOption is disabled, all requests to C4C will be ignored.');
        }
    }

    async createOrUpdateProduct(product: IProduct): Promise<void> {
        if (!this.isEnabled) {
            return;
        }

        await this.apiFactory.createProductEndpoint().createOrUpdateProduct(product);
        Logger.log('CRMService.createOrUpdateProduct');
    }

    async createCompetitorEquipment(input: CRMCompetitorEquipmentDto) {
        if (!this.isEnabled) {
            return;
        }

        return this.apiFactory.createCompetitorEndpoint().createCompetitorEquipment(input);
    }

    async getCompetitorEquipmentByQuery(query: { id: string; serialNo: string }): Promise<CRMCompetitorEquipmentDto[]> {
        if (!this.isEnabled) {
            return;
        }
        return this.apiFactory.createCompetitorEndpoint().getCompetitorEquipmentByQuery(query);
    }

    async getEquipmentsByQuery(query: { serialId: string }): Promise<CRMEquipmentDto[]> {
        if (!this.isEnabled) {
            return;
        }
        return this.apiFactory.createEquipmentEndpoint().getEquipmentsByQuery(query);
    }

    async registerEquipmentsToWarranty(input: RegisterCrmWarrantyEquipmentsInput): Promise<CRMEquipmentDto[]> {
        return await this.apiFactory.createEquipmentEndpoint().registerEquipmentsToWarranty(input.equipmentIds, input);
    }

    async getCustomerByQuery(query: { email?: string; phone?: string; id?: string }) {
        if (!this.isEnabled) {
            return;
        }
        return this.apiFactory.createCustomerEndpoint().getCustomerByQuery(query);
    }

    async createCustomer(input: CreateCRMCustomerInput): Promise<CRMCustomerDto> {
        if (!this.isEnabled) {
            return;
        }
        return this.apiFactory.createCustomerEndpoint().createCustomer(input);
    }

    async createCustomerIfNotExist(customerInput: CreateCRMCustomerInput): Promise<CRMCustomerDto> {
        const customer = await this.getCustomerByQuery({ email: customerInput.email, phone: customerInput.phone });
        if (customer) {
            return customer;
        }

        return await this.createCustomer(customerInput);
    }

    async createServiceRequest(serviceRequest: IServiceRequest): Promise<void> {
        if (!this.isEnabled) {
            return;
        }
        await this.apiFactory.createServiceRequestEndpoint().createServiceRequest(serviceRequest);
        this.logger.log(serviceRequest, 'CRMService.createServiceRequest');
    }

    async closeServiceRequest(serviceRequest: IServiceRequest): Promise<void> {
        if (!this.isEnabled) {
            return;
        }

        await this.apiFactory.createServiceRequestEndpoint().closeServiceRequest(serviceRequest);
        this.logger.log(serviceRequest, 'CRMService.closeServiceRequest');
    }
}
