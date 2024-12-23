import { DeepPartial } from 'typeorm';

export class ConsumerQuotation {
    constructor(input?: DeepPartial<ConsumerQuotation>) {
        if (input) {
            for (const [key, value] of Object.entries(input)) {
                (this as any)[key] = value;
            }
        }
    }

    minQuantity: number;

    unitPrice: number;
}
