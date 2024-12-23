import { Logger } from '@nestjs/common';
import { CRMCustomerDto } from '../dtos/crm-customer.dto';
import { CreateCRMCustomerInput } from '../inputs/create-crm-customer.input';
import { AbstractEndpoint } from './abstract.endpoint';

export class CRMCustomerEndpoint extends AbstractEndpoint {
    private readonly logger = new Logger(CRMCustomerEndpoint.name);

    /**
     * Get customer by email or phone. Note: It's case-insensitive filtration on email. For eg:
     * 'richman@hotmail.com' === 'riRCHMAN@hotmail.com'
     * @param email Daikin customer email
     */
    async getCustomerByQuery(query: { email?: string; phone?: string; id?: string }): Promise<CRMCustomerDto> {
        let filter = '';
        if (query.email && query.phone) {
            filter += `$filter=Email eq '${query.email}' and Phone eq '${query.phone}'`;
        } else if (query.email) {
            filter += `$filter=Email eq '${query.email}'`;
        } else if (query.phone) {
            filter += `$filter=Phone eq '${query.phone}'`;
        } else if (query.id) {
            filter += `$filter=CustomerID eq '${query.id}'`;
        }

        const raw = await this.execute({
            collection: `IndividualCustomerCollection?$orderby=CreationOn desc&${filter}`,
            method: 'GET',
            entity: null,
        });

        const results = raw?.d?.results || [];
        if (results.length < 1) {
            return null;
        }
        this.logger.log(results[0], `IndividualCustomerCollection?${filter}`);

        return CRMCustomerDto.fromC4CResponse(results[0]);
    }

    /**
     * warning: Crm doesn't have unique constraint on email or phone. Each copy will have its own CustomerID.
     * @param customer input dto to create customer
     */
    async createCustomer(customer: CreateCRMCustomerInput): Promise<CRMCustomerDto> {
        const raw = await this.execute({
            collection: 'IndividualCustomerCollection',
            method: 'POST',
            entity: customer.toC4CPayload(),
        });

        const result = raw?.d?.results;
        if (!result) {
            return null;
        }

        return CRMCustomerDto.fromC4CResponse(result);
    }
}
