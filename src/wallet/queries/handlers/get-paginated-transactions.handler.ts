import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletTransaction } from '../../entities/wallet-transaction.entity';
import { GetPaginatedTransactionsQuery } from '../get-paginated-transactions.query';


@QueryHandler(GetPaginatedTransactionsQuery)
export class GetPaginatedTransactionsHandler
    implements IQueryHandler<GetPaginatedTransactionsQuery> {

    constructor(@InjectRepository(WalletTransaction) private readonly repository: Repository<WalletTransaction>) { }

    async execute(query: GetPaginatedTransactionsQuery) {
        const { pagination, providerId } = query;
        const [data, total] = await this.repository.findAndCount({
            where: {
                ownerId: providerId
            },
            skip: pagination.offset,
            take: pagination.limit,
            order: { createdAt: 'DESC' }
        });
        return {
            data,
            total,
            count: data.length,
            page: pagination.page,
            pageCount: Math.ceil(total / pagination.limit)
        };
    }

}