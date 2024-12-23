import { Logger } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payout } from '@payout/entities/payout.entity';
import { IPayout } from '@payout/interfaces/payout.interface';
import { GetPayoutQuery } from '../get-payout.query';

@QueryHandler(GetPayoutQuery)
export class GetPayoutHandler implements IQueryHandler<GetPayoutQuery> {
    private readonly logger = new Logger(GetPayoutHandler.name);
    constructor(@InjectRepository(Payout) private readonly repository: Repository<Payout>) {}

    async execute(query: GetPayoutQuery): Promise<IPayout> {
        const { id } = query;
        const payout = await this.repository.findOne({ id });
        if (!payout) {
            this.logger.error(`Payout not found: ${id}`);
            return null;
        }
        return payout;
    }
}
