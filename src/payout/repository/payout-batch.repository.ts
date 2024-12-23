import { AbstractRepository, EntityRepository } from 'typeorm';
import { PayoutBatch } from '@payout/entities/payout-batch.entity';
import { PayoutBatchStatusEnum } from '@payout/enums/payout-batch-status.enum';

@EntityRepository(PayoutBatch)
export class PayoutBatchRepository extends AbstractRepository<PayoutBatch> {
    async findInTransitPayoutBatches(): Promise<PayoutBatch[]> {
        return this.repository.find({
            where: {
                status: PayoutBatchStatusEnum.IN_TRANSIT,
            },
        });
    }
}
