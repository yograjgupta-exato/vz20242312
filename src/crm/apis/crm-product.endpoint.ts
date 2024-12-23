import { Logger } from '@nestjs/common';
import { AbstractEndpoint } from './abstract.endpoint';
import { IProduct } from 'crm/crm.interface';

export class CRMProductEndpoint extends AbstractEndpoint {
    private readonly logger = new Logger(CRMProductEndpoint.name);

    async createOrUpdateProduct(product: IProduct): Promise<any> {
        if (product.ProductID) {
            const existing = await this.execute({
                collection: `ProductCollection?$filter=ProductID eq '${product.ProductID.toUpperCase()}'`,
                method: 'GET',
                entity: null,
            });

            this.logger.log(existing, `ProductCollection?$filter=ProductID eq '${product.ProductID}'`);

            const results: any[] = existing?.d?.results as any[];
            if (results.length) {
                await this.execute({
                    collection: `ProductCollection('${(existing?.d?.results[0] as any).ObjectID}')`,
                    method: 'PATCH',
                    entity: {
                        Description: product.Description,
                    },
                });
            }
        }

        await this.execute({
            collection: 'ProductCollection',
            method: 'POST',
            entity: product,
        });
    }

}