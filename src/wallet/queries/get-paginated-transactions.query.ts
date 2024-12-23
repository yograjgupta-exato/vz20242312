import { IPagination } from '@shared/decorators';

export class GetPaginatedTransactionsQuery {
    constructor(
        public readonly providerId: string,
        public readonly pagination: IPagination) { }
}