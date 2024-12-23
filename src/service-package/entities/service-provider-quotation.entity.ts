import { DeepPartial } from 'typeorm';

export class ServiceProviderQuotation {
    constructor(input?: DeepPartial<ServiceProviderQuotation>) {
        if (input) {
            for (const [key, value] of Object.entries(input)) {
                (this as any)[key] = value;
            }
        }
    }

    minQuantity: number;

    unitPrice: number;

    state: string;
}
