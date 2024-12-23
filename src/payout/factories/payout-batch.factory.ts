import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Repository } from 'typeorm';
import { PayoutBatch } from '../entities/payout-batch.entity';
import { IPayout } from '../interfaces/payout.interface';

@Injectable()
export class PayoutBatchFactory {
    constructor(
        // refactor(roy): use queryBus for cross-module communication.
        @InjectRepository(PayoutBatch)
        private readonly repository: Repository<PayoutBatch>,
    ) {}

    public async create(payouts: IPayout[], now: Date): Promise<PayoutBatch> {
        const [, count] = await this.repository.findAndCount({
            where: {
                principalGroup: payouts[0].getPrincipalGroup(),
                date: moment(now).format('YYYY/MM/DD'),
            },
        });
        return new PayoutBatch(payouts, count + 1, now);
    }
}
