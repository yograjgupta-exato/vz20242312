import { AbstractRepository, EntityRepository, Raw } from 'typeorm';
import { Payout } from '@payout/entities/payout.entity';
import { PayoutStatusEnum } from '@payout/enums/payout-status.enum';
import { IPayout } from '@payout/interfaces/payout.interface';

@EntityRepository(Payout)
export class PayoutRepository extends AbstractRepository<Payout> {
    async findScheduledPayouts(): Promise<IPayout[]> {
        return this.repository.find({
            where: {
                status: PayoutStatusEnum.SCHEDULED,
                bank: {
                    accountHolderName: Raw(alias => `(${alias} IS NOT NULL AND ${alias} != '')`),
                    accountNumber: Raw(alias => `(${alias} IS NOT NULL AND ${alias} != '')`),
                    bankName: Raw(alias => `(${alias} IS NOT NULL AND ${alias} != '')`),
                    swiftCode: Raw(alias => `(${alias} IS NOT NULL AND ${alias} != '')`),
                    vendorId: Raw(alias => `(${alias} IS NOT NULL AND ${alias} != '')`),
                },
            },
        });
    }
}
