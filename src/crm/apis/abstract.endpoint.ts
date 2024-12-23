import { Logger } from '@nestjs/common';
import { OData, PlainODataSingleResponse } from 'odata-client';
import { ThirdPartyApiError } from '@shared/errors';
import 'odata-client/lib/polyfill';

export abstract class AbstractEndpoint {
    public constructor(protected readonly client: OData) { }
    private readonly _logger = new Logger(AbstractEndpoint.name);

    protected async execute({ collection, method, entity }): Promise<PlainODataSingleResponse<any>> {
        const response = await this.client.newRequest({
            collection,
            method,
            entity,
        });

        if (response.error) {
            throw new ThirdPartyApiError('CRMApiFactory', JSON.stringify(response));
        }
        // TODO: check how to truncate
        // this._logger.log(response);
        return response;
    }
}
