import { plainToClass } from 'class-transformer';
import { Repository, EntityRepository, IsNull, In } from 'typeorm';
import { GroupByDate } from '@shared/enums/group-by-date';
import { WalletTransactionType } from '@shared/enums/wallet-transaction-type';
import { WalletTransactionStatusEnum } from '@wallet/enums/wallet-transaction-status.enum';
import { IPayout } from '@payout/interfaces/payout.interface';
import { EarningSummaryRowDto } from 'wallet/dtos/earning-summary-row.dto';
import { EarningSummaryDto } from 'wallet/dtos/earning-summary.dto';
import { WalletTransaction } from 'wallet/entities/wallet-transaction.entity';

@EntityRepository(WalletTransaction)
export class WalletTransactionRepository extends Repository<WalletTransaction> {
    async findEarningSummary(ownerId: string, fromDate: Date, toDate: Date, groupBy: GroupByDate): Promise<EarningSummaryDto> {
        let strGroupBy = '';
        switch (groupBy) {
            case GroupByDate.DAY:
                strGroupBy = 'Day';
                break;

            case GroupByDate.WEEK:
                strGroupBy = 'Week';
                break;

            case GroupByDate.MONTH:
                strGroupBy = 'Month';
                break;

            case GroupByDate.TO_DATE:
                return this.findToDateEarningSummary(ownerId);

            default:
                throw new Error('Unknown GroupByDate filter: ' + groupBy);
        }

        // refactor(roy): add config for value 'Asia/Kuala_Lumpur'
        const localDateSelector = `date_trunc('${strGroupBy}', timezone('Asia/Kuala_Lumpur',
            trx.created_at::timestamptz)::date)::timestamp AS local_date`;
        const utcDateSelector = `timezone('Asia/Kuala_Lumpur', date_trunc('${strGroupBy}', timezone('Asia/Kuala_Lumpur',
            trx.created_at::timestamptz)::date)::timestamp) AS utc_date`;

        const result = await this.createQueryBuilder('trx')
            .select(localDateSelector)
            .addSelect(utcDateSelector)
            .addSelect('SUM(trx.amount)', 'amount')
            .addSelect('trx.currency', 'currency')
            .where('trx.created_at >= :fromDate', { fromDate: fromDate.toISOString() })
            .andWhere('trx.created_at <=:toDate', { toDate: toDate.toISOString() })
            .andWhere('trx.type = :type', { type: WalletTransactionType.INCOME })
            .andWhere('trx.owner_id = :ownerId', { ownerId })
            .groupBy('local_date')
            .addGroupBy('trx.currency')
            .getRawMany();

        const earningSummaryRows = plainToClass(
            EarningSummaryRowDto,
            result.map(r => ({
                date: r.utc_date,
                currency: r.currency,
                amount: r.amount,
            })),
        );
        return EarningSummaryDto.from(earningSummaryRows);
    }

    async findToDateEarningSummary(ownerId: string): Promise<EarningSummaryDto> {
        const result = await this.createQueryBuilder('trx')
            .select('trx.owner_id')
            .addSelect('SUM(trx.amount)', 'amount')
            .addSelect('trx.currency', 'currency')
            .andWhere('trx.type = :type', { type: WalletTransactionType.INCOME })
            .andWhere('trx.owner_id = :ownerId', { ownerId })
            .groupBy('trx.owner_id')
            .addGroupBy('trx.currency')
            .getRawMany();

        const earningSummaryRows = plainToClass(
            EarningSummaryRowDto,
            result.map(r => ({
                date: r.utc_date,
                currency: r.currency,
                amount: r.amount,
            })),
        );
        return EarningSummaryDto.from(earningSummaryRows);
    }

    async findDebitableTransactionsForPayout(): Promise<WalletTransaction[]> {
        const transactions: WalletTransaction[] = await this.find({
            where: {
                type: In([WalletTransactionType.INCOME, WalletTransactionType.RESCHEDULE_SURCHARGE_COMPENSATION]),
                payoutId: IsNull(),
            },
        });
        return transactions;
    }

    async getPendingPayoutTransactionByPayoutId(payoutId: string): Promise<WalletTransaction> {
        const [walletTransaction] = await this.find({
            where: {
                payoutId,
                status: WalletTransactionStatusEnum.PENDING,
                type: WalletTransactionType.PAYOUT,
            },
        });
        return walletTransaction;
    }
}
