import { DeepPartial } from 'typeorm';

export class PostalCodeRange {
    constructor(input?: DeepPartial<PostalCodeRange>) {
        if (input) {
            for (const [key, value] of Object.entries(input)) {
                (this as any)[key] = value;
            }
        }
    }
    minPostalCode: number;
    maxPostalCode: number;
}