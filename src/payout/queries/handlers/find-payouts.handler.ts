import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payout } from '../../entities/payout.entity';
import { IPayout } from '../../interfaces/payout.interface';
import { FindPayoutsQuery } from '../find-payouts.query';

@QueryHandler(FindPayoutsQuery)
export class FindPayoutsHandler implements IQueryHandler<FindPayoutsQuery> {
    constructor(@InjectRepository(Payout) private readonly repository: Repository<Payout>) {}

    async execute(
        query: FindPayoutsQuery,
    ): Promise<{
        data: IPayout[];
        total: number;
        count: number;
        page: number;
        pageCount: number;
    }> {
        const { pagination, filter } = query;
        const [data, total] = await this.repository.findAndCount({
            take: pagination.limit,
            skip: pagination.offset,
            order: { createdAt: 'DESC' },
            where: {
                ...(filter.serviceGroup && { principalGroup: filter.serviceGroup }),
                ...(filter.status && { status: filter.status }),
                ...(filter.id && { id: filter.id }),
            },
        });

        return {
            data,
            total,
            count: data.length,
            page: pagination.page,
            pageCount: Math.ceil(total / pagination.limit),
        };
    }
}
