import { ServiceRequestMappingKeys } from '../crm.enum';
import { IServiceRequest } from '../crm.interface';
import { AbstractEndpoint } from './abstract.endpoint';

export class CRMServiceRequestEndpoint extends AbstractEndpoint {
    async createServiceRequest(serviceRequest: IServiceRequest): Promise<void> {
        await this.execute({
            collection: 'ServiceRequestCollection',
            method: 'POST',
            entity: serviceRequest,
        });
    }

    async closeServiceRequest(serviceRequest: IServiceRequest): Promise<void> {
        const existing = await this.client.newRequest({
            collection: `ServiceRequestCollection?$filter=${ServiceRequestMappingKeys.id} eq '${serviceRequest[ServiceRequestMappingKeys.id]}'`,
            method: 'GET',
        });

        if (existing?.d?.results.length) {
            await this.execute({
                collection: `ServiceRequestCollection('${(existing?.d?.results[0] as any).ObjectID}')`,
                method: 'PATCH',
                entity: {
                    ServiceRequestUserLifeCycleStatusCode: 'Z3',
                },
            });
        }
    }
}
