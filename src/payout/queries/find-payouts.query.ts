import { IPagination } from '../../shared/decorators';

export class FindPayoutsQuery {
    constructor(public readonly pagination: IPagination, public readonly filter: { serviceGroup?: string; status?: string; id?: string }) {}
}
