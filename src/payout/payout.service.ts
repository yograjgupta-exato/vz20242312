import * as fs from 'fs';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { getCustomRepository, In, Repository } from 'typeorm';
import { AppConfigService } from '@shared/config';
import { Tenant } from '@shared/enums';
import { IServiceProvider } from '@service-provider/interfaces/service-provider.interface';
import { GetPayableServiceProvidersQuery } from '@service-provider/queries/get-payable-service-providers.query';
import { WalletTransaction } from '@wallet/entities/wallet-transaction.entity';
import { GetDebitableTransactionsForPayoutQuery } from '@wallet/queries/get-debitable-transactions-for-payout.query';
import { PAYOUT_FILE_DELIMITER } from '../shared/constants';
import { FtpService } from '../shared/services/ftp.service';
import { HoldBalanceForPayoutCommand } from '../wallet/commands/hold-balance-for-payout.command';
import { MarkPayoutLinesAsPaidInput } from './dtos/payout-lines.input';
import { PayoutBatch } from './entities/payout-batch.entity';
import { PayoutLine } from './entities/payout-line.entity';
import { Payout } from './entities/payout.entity';
import { PayoutPaidEvent, PayoutScheduledEvent } from './events/payout.event';
import { PayoutBatchFactory } from './factories/payout-batch.factory';
import { PayoutLinesFileBuilder } from './factories/payout-lines-file.builder';
import { PayoutLineFactory } from './factories/payout-lines.factory';
import { PayoutSummaryFileBuilder } from './factories/payout-summary-file.builder';
import { PayoutFactory } from './factories/payout.factory';
import { ScbPaymentRecordsBuilder } from './factories/scb-payment-records.builder';
import { IPayout } from './interfaces/payout.interface';
import { PayoutBatchRepository } from './repository/payout-batch.repository';
import { PayoutRepository } from './repository/payout.repository';
import { FileService } from 'file/file.service';

@Injectable()
export class PayoutService {
    private readonly logger = new Logger(PayoutService.name);

    constructor(
        @InjectRepository(Payout) private readonly repository: Repository<Payout>,
        @InjectRepository(PayoutBatch) private readonly payoutBatchRepository: Repository<PayoutBatch>,
        @InjectRepository(PayoutLine) private readonly payoutLineRepository: Repository<PayoutLine>,
        @Inject(PayoutLineFactory) private readonly payoutLineFactory: PayoutLineFactory,
        @Inject(PayoutFactory) private readonly payoutFactory: PayoutFactory,
        @Inject(PayoutBatchFactory) private readonly payoutBatchFactory: PayoutBatchFactory,
        private readonly configService: AppConfigService,
        private readonly eventBus: EventBus,
        private readonly fileService: FileService,
        private readonly ftpService: FtpService,
        private readonly queryBus: QueryBus,
        private commandBus: CommandBus,
    ) {}

    async schedulePayoutsFromWalletTransactions() {
        const transactions: WalletTransaction[] = await this.queryBus.execute(new GetDebitableTransactionsForPayoutQuery());
        const serviceProviders: IServiceProvider[] = await this.queryBus.execute(
            new GetPayableServiceProvidersQuery(transactions.map(trx => trx.ownerId)),
        );

        const payouts = this.payoutFactory.create(transactions, serviceProviders);
        await this.repository.save(payouts);

        // refactor(roy): this is for show business only.
        //const newIncomeTransactions: WalletTransaction[] = await this.queryBus.execute(new GetDebitableTransactionsForPayoutQuery());
        const payoutLines = await this.payoutLineFactory.create(transactions, serviceProviders);
        await this.payoutLineRepository.save(payoutLines);

        payouts.forEach(payout => {
            this.eventBus.publish(new PayoutScheduledEvent(payout));
        });
        return payouts;
    }

    async sievePayoutLinesByTenant(payoutLines: PayoutLine[]) {
        const daikinPayoutLines = payoutLines.filter(line => line.principalGroup === Tenant.Daikin);
        const acsonPayoutLines = payoutLines.filter(line => line.principalGroup === Tenant.Acson);

        return { daikinPayoutLines, acsonPayoutLines };
    }

    async sievePayoutsByTenant(payouts: IPayout[]) {
        const daikinPayouts = payouts.filter(payout => payout.getPrincipalGroup() === Tenant.Daikin);
        const acsonPayouts = payouts.filter(payout => payout.getPrincipalGroup() === Tenant.Acson);

        return { daikinPayouts, acsonPayouts };
    }

    // refactor(roy): into builder/factory/strategy pattern
    async generateAndUploadPaymentFiles() {
        const payouts: IPayout[] = await getCustomRepository(PayoutRepository).findScheduledPayouts();

        const payoutLines: PayoutLine[] = await this.payoutLineRepository.find({
            where: {
                payoutId: In(payouts.map(payout => payout.getId())),
            },
        });

        const { daikinPayouts, acsonPayouts } = await this.sievePayoutsByTenant(payouts);
        const { daikinPayoutLines, acsonPayoutLines } = await this.sievePayoutLinesByTenant(payoutLines);

        const daikinPayerCityCode = this.configService.tenantOptions(Tenant.Daikin).bankAccountCityCode;
        const daikinPayerAccountNumber = this.configService.tenantOptions(Tenant.Daikin).bankAccountNumber;

        const acsonPayerCityCode = this.configService.tenantOptions(Tenant.Acson).bankAccountCityCode;
        const acsonPayerAccountNumber = this.configService.tenantOptions(Tenant.Acson).bankAccountNumber;

        const now = moment()
            .clone()
            .utcOffset(this.configService.timezoneOffset)
            .toDate();

        // first batch
        await this.createPayoutBatch(daikinPayerAccountNumber, daikinPayerCityCode, daikinPayouts, daikinPayoutLines, now);

        // second batch
        await this.createPayoutBatch(acsonPayerCityCode, acsonPayerAccountNumber, acsonPayouts, acsonPayoutLines, now);

        return payouts;
    }

    // refactor(roy)
    private async buildAndUploadScbPaymentFile(
        payoutBatch: PayoutBatch,
        payerAccountNumber: string,
        payerCityCode: string,
        payouts: IPayout[],
        now: Date,
    ) {
        const fName = `MY_${payouts[0].getPrincipalGroup()}_${moment(now).format('YYYYMMDD')}${String('000' + payoutBatch.dailyRunningCount).slice(
            -3,
        )}.csv`;

        const records = new ScbPaymentRecordsBuilder(payoutBatch.id, now, payerAccountNumber, payerCityCode, payouts);
        const fContent = records.getResult().reduce((content, r) => content + r.join(',') + '\r\n', '');
        const uploadedResult = await this.fileService.writeToPayoutsBucket(fName, fContent.slice(0, fContent.length - 1));
        this.logger.log(`scb-payment-file: uploaded to s3 ${uploadedResult}`);

        return uploadedResult;
    }

    // refactor(roy)
    private async buildAndUploadPayoutSummaryFile(payoutBatch: PayoutBatch, payoutLines: PayoutLine[], now: Date) {
        const fName = `SUP_1_${payoutLines[0].principalGroup}_${moment(now).format('YYYYMMDD')}${String('000' + payoutBatch.dailyRunningCount).slice(
            -3,
        )}.csv`;

        const records = new PayoutSummaryFileBuilder(payoutLines, now);
        const fContent = records.getResult(false).reduce((content, r) => content + r.join(PAYOUT_FILE_DELIMITER) + '\n', '');
        const uploadedResult = await this.fileService.writeToPayoutsBucket(fName, fContent.slice(0, fContent.length - 1));
        this.logger.log(`payout-summary-file: uploaded to s3 ${uploadedResult}`);

        if (this.configService.payoutOptions) {
            await this.ftpService.uploadFile(
                fContent,
                `${this.configService.payoutOptions.paymentFileUploadPath}\\${fName}`,
                this.configService.payoutOptions.ftp,
            );
        }

        return uploadedResult;
    }

    // refactor(roy)
    private async buildAndUploadPayoutLinesFile(payoutBatch: PayoutBatch, payoutLines: PayoutLine[], now: Date) {
        const fName = `SUP_2_${payoutLines[0].principalGroup}_${moment(now).format('YYYYMMDD')}${String('000' + payoutBatch.dailyRunningCount).slice(
            -3,
        )}.csv`;

        const records = new PayoutLinesFileBuilder(payoutLines);

        const fContent = records.getResult(false).reduce((content, r) => content + r.join(PAYOUT_FILE_DELIMITER) + '\n', '');
        const uploadedResult = await this.fileService.writeToPayoutsBucket(fName, fContent.slice(0, fContent.length - 1));
        this.logger.log(`payout-lines-file: uploaded to s3 ${uploadedResult}`);

        if (this.configService.payoutOptions) {
            await this.ftpService.uploadFile(
                fContent,
                `${this.configService.payoutOptions.paymentFileUploadPath}\\${fName}`,
                this.configService.payoutOptions.ftp,
            );
        }

        return uploadedResult;
    }

    private async createPayoutBatch(payerAccountNumber: string, payerCityCode: string, payouts: IPayout[], payoutLines: PayoutLine[], now: Date) {
        if (payouts.length > 1 && payoutLines.length < 1) {
            throw new Error('Empty payout lines detected');
        }

        if (payouts.length < 1 || payoutLines.length < 1) {
            return;
        }
        const payoutBatch = await this.payoutBatchFactory.create(payouts, now);
        await this.payoutBatchRepository.save(payoutBatch);

        try {
            // refactor(roy): a factory to upload 3 files.
            const scbPaymentFileUploadResult = await this.buildAndUploadScbPaymentFile(payoutBatch, payerAccountNumber, payerCityCode, payouts, now);
            const payoutSummaryFileUploadResult = await this.buildAndUploadPayoutSummaryFile(payoutBatch, payoutLines, now);
            const payoutLinesFileUploadResult = await this.buildAndUploadPayoutLinesFile(payoutBatch, payoutLines, now);

            payoutBatch.setUploadedPaymentFiles(
                scbPaymentFileUploadResult.Location,
                payoutSummaryFileUploadResult.Location,
                payoutLinesFileUploadResult.Location,
            );

            payoutLines.forEach(line => line.payoutBatchInTransit(payoutBatch.id));
            await this.payoutLineRepository.save(payoutLines);
        } catch (err) {
            this.logger.error(err);
            payoutBatch.paymentFileUploadFailed(err.toString());
        } finally {
            try {
                await this.payoutBatchRepository.save(payoutBatch);
            } catch (err) {
                this.logger.error(err);
            }
        }
    }

    // note(roy): this is to simulate backend process (success) from daikin - as the integration is completed,
    // we will not be triggering this function.
    async markEveryInTransitPayoutBatchesAsPaid() {
        const payoutBatches = await getCustomRepository(PayoutBatchRepository).findInTransitPayoutBatches();
        payoutBatches.forEach(payoutBatch => {
            payoutBatch.markAsPaid();
        });

        await this.payoutBatchRepository.save(payoutBatches);

        payoutBatches.forEach(payoutBatch =>
            payoutBatch.payouts.filter(payout => payout.hasPaid()).forEach(payout => this.eventBus.publish(new PayoutPaidEvent(payout))),
        );
    }

    async markPayoutLinesAsPaidInBulk(inputs: MarkPayoutLinesAsPaidInput[]) {
        for (const input of inputs) {
            await this.markPayoutLinesAsPaid(input);
        }
    }

    /**
     * Thread-safe since .decrement() is atomic typeorm-ops.
     * @param input
     */
    async markPayoutLinesAsPaid(input: MarkPayoutLinesAsPaidInput) {
        const { serviceRequestId, serviceProviderVendorId } = input;
        const payoutLines = await this.payoutLineRepository.find({
            where: {
                serviceRequestId,
                ownerVendorId: serviceProviderVendorId,
            },
        });

        if (payoutLines.length < 1) {
            throw new Error(
                `Unable to locate payout-lines with
                (serviceRequestId:'${serviceRequestId}' and serviceProviderVendorId:'${serviceProviderVendorId}')`,
            );
        }
        payoutLines.forEach(line => line.markAsPaid(input.sapDocumentPaymentNo, input.paymentDate));
        await this.payoutLineRepository.save(payoutLines);

        const payoutId = payoutLines[0].payoutId;
        const updatePayoutResult = await this.repository.increment(
            {
                id: payoutId,
            },
            'processedAmount',
            payoutLines.reduce((sum, line) => sum + line.amount, 0),
        );

        if (updatePayoutResult.affected < 1) {
            throw new Error(
                `Unable to locate payout with (id: '${payoutId})'
                from payout-lines (serviceRequestId:'${serviceRequestId}' and serviceProviderVendorId:'${serviceProviderVendorId}')`,
            );
        }

        const payout = await this.repository.findOne({ id: payoutId });
        if (!payout.hasPaymentFullyProcessed()) {
            return;
        }
        payout.markAsPaid();
        await this.repository.save(payout);
        this.eventBus.publish(new PayoutPaidEvent(payout));
    }

    async testFtpConnection() {
        await this.ftpService.uploadFile(
            new Date().toISOString(),
            `${this.configService.payoutOptions.paymentFileUploadPath}/test.log`,
            this.configService.payoutOptions.ftp,
        );

        await this.ftpService.renameFile(
            `${this.configService.payoutOptions.paymentFileUploadPath}/test.log`,
            `${this.configService.payoutOptions.returnFileDownloadPath}/test.log`,
            this.configService.payoutOptions.ftp,
        );

        await this.ftpService.downloadFile(
            `${this.configService.payoutOptions.returnFileDownloadPath}/test.log`,
            'test.log',
            this.configService.payoutOptions.ftp,
        );

        await this.ftpService.removeFile(`${this.configService.payoutOptions.returnFileDownloadPath}/test.log`, this.configService.payoutOptions.ftp);
    }

    async processPaymentStatus() {
        const payoutOptions = this.configService.payoutOptions;
        if (!payoutOptions) {
            return;
        }

        const returnFileBackupPath = payoutOptions.returnFileBackupFilePath;
        const shouldBackupReturnFile = returnFileBackupPath && returnFileBackupPath.length > 0;

        const files = await this.ftpService.listFiles(payoutOptions.returnFileDownloadPath, payoutOptions.ftp);

        for (const f of files) {
            if (!f.startsWith('uber_paystatus')) {
                continue;
            }
            try {
                await this.ftpService.downloadFile(`${payoutOptions.returnFileDownloadPath}\\${f}`, f, payoutOptions.ftp);
                const data = fs.readFileSync(f, 'UTF-8');
                if (data.length > 0) {
                    const lines = data.split(/\r?\n/);
                    for (const l of lines) {
                        if (l.trim().length === 0) {
                            continue;
                        }
                        const columns = l.split(PAYOUT_FILE_DELIMITER);
                        if (columns.length === 4) {
                            try {
                                await this.markPayoutLinesAsPaid({
                                    serviceRequestId: columns[0].trim(),
                                    sapDocumentPaymentNo: columns[1].trim(),
                                    serviceProviderVendorId: columns[2].trim(),
                                    paymentDate: columns[3].trim(),
                                });
                            } catch (err) {
                                this.logger.error(`Found invalid line for payment status: ${l}. Message: ${err.message}`);
                            }
                        } else {
                            this.logger.error(`Found invalid line for payment status: ${l}`);
                        }
                    }
                }

                if (shouldBackupReturnFile) {
                    await this.ftpService.renameFile(
                        `${payoutOptions.returnFileDownloadPath}\\${f}`,
                        `${payoutOptions.returnFileBackupFilePath}\\${f}`,
                        payoutOptions.ftp,
                    );
                } else {
                    await this.ftpService.removeFile(`${payoutOptions.returnFileDownloadPath}\\${f}`, payoutOptions.ftp);
                }
            } catch (err) {
                this.logger.error(err);
            } finally {
                fs.unlinkSync(f);
            }
        }
    }

    async patchMissingPayoutTransactions() {
        const rawMissingPayoutIds = [
            {
                id: 'a653293f-8afe-480e-aed4-08f316df7528',
            },
            {
                id: '9abc4c2a-1a04-42a8-ae47-7bbec5f104b4',
            },
            {
                id: '461cf088-ca9e-458c-aedd-aadc68e1f863',
            },
            {
                id: '68808d4d-ec9d-43a5-814e-60227c65e764',
            },
            {
                id: '632a8cb7-5785-43ec-b118-4d08d081c705',
            },
            {
                id: '4eff51b9-7a32-49f8-ac4f-998d5e6f00f1',
            },
            {
                id: 'c256d7f3-ad6d-41a5-bc9e-c0ece8e78aa1',
            },
            {
                id: 'c6085dd8-50ce-4c68-9579-37b8ae93e0f6',
            },
            {
                id: '87febb6a-348b-4ea0-9a3e-5ef15aa93070',
            },
            {
                id: '13349dc6-57d5-4643-9aa6-0f045ac5430f',
            },
            {
                id: '44c86a11-59ec-406f-90c6-ffcc18915eca',
            },
            {
                id: 'f14e9c5a-7a41-46bb-bd9a-6cacc8771f9f',
            },
            {
                id: '939e487a-dc6d-4847-8cab-df81102b8039',
            },
            {
                id: '5d191101-7192-4919-a376-0615ee2eb9a7',
            },
            {
                id: '040dcec6-0a96-462c-82dc-57a7dc17a034',
            },
            {
                id: 'f8c94f70-c1dd-4d37-89e6-6143896be9a7',
            },
            {
                id: '839fd2fb-c7e0-44f5-b011-2713d53cd1f9',
            },
            {
                id: '381f8d17-5db3-487e-b4a0-09b9a694632f',
            },
            {
                id: '4af73781-dcb1-436a-963a-da586eb47692',
            },
            {
                id: '172d04a8-5bb8-4b0f-9115-7e7ef9229974',
            },
            {
                id: '18468e6f-cdd9-4f09-8d0e-b056a6b4cd65',
            },
            {
                id: 'e2714028-20cb-4f14-9691-c71ba2245be8',
            },
            {
                id: 'e5a9f4d9-5f44-4f6b-95a0-7742b816f6b6',
            },
            {
                id: 'e56bed45-9959-4581-9225-76725b6d1a00',
            },
            {
                id: '600ce313-3a11-40bb-abc2-f58b653b1163',
            },
            {
                id: 'b3f1ef80-a58e-448b-b0c8-cc02638abd74',
            },
            {
                id: '85752c2f-95d3-4392-abfd-530344f1fa3d',
            },
            {
                id: 'ff225479-bfd9-466d-b9ed-4453a844a24a',
            },
            {
                id: '11166026-eb67-4054-b8a0-04504ae14c86',
            },
            {
                id: 'af7eeefb-3c11-4fdf-b209-fb96316b2d4c',
            },
            {
                id: '1bf86433-07e2-476b-bc15-3e0d3ef1eebf',
            },
            {
                id: 'e10f4e82-c229-4581-a3c2-3b8e00c2c946',
            },
            {
                id: '9dbe5580-7509-44aa-b787-ef5d39307044',
            },
            {
                id: '7d623482-5aec-47e8-9c81-04f0e1489fbe',
            },
            {
                id: '19c68dbf-3001-4fee-9003-7ca5d8bd63d5',
            },
            {
                id: '8dc9ca40-eb8d-4e83-8e26-077090364922',
            },
            {
                id: '05711d2e-9264-4ef1-9697-993d9a5a9153',
            },
            {
                id: '2fad0bb3-5f4c-4556-97ac-a1fe15d57575',
            },
            {
                id: 'fc45ab90-3e09-4173-b8a9-6f2fdca72b4b',
            },
            {
                id: 'bfc642f9-cb74-4abc-8c1f-64997bdff59f',
            },
            {
                id: '014b35c1-6a2c-48d4-9c87-0184c9f3eb5c',
            },
            {
                id: 'afd16eff-7a01-4c3e-a144-470e34815ae4',
            },
            {
                id: 'a087cf2d-0c50-4027-a908-917848ad5ad3',
            },
            {
                id: 'd51185d4-3c52-4aba-b3c8-45e39f1ad431',
            },
            {
                id: 'e17d4f2f-e12a-4db6-b78f-8c471c52df21',
            },
            {
                id: '45c34ab7-ba41-498f-80ac-1d5f8553b946',
            },
            {
                id: '6f1af505-c62f-4ca3-a7a5-275724007841',
            },
            {
                id: 'c6d6fe42-8101-4bd4-9873-aefb2fa819d3',
            },
            {
                id: '283add99-70aa-4db2-87de-986b923b1dab',
            },
            {
                id: '418d8d88-d791-4bca-b600-88b63af1a43a',
            },
            {
                id: 'a2660ce3-b4a6-479e-af4a-7fd20b6ce1ee',
            },
            {
                id: '07359a57-dea9-476b-97cf-64f89f843e8f',
            },
            {
                id: '72acc4cf-306e-4c4e-8349-40e87d86793e',
            },
            {
                id: 'a948a779-ef82-4f00-941c-b8862f6aeee9',
            },
            {
                id: '850a63ca-ecb8-47c9-ab45-e90b1dcb421d',
            },
        ];
        const missingPayoutIds = rawMissingPayoutIds.map(item => item.id);
        for (const payoutId of missingPayoutIds) {
            await this.commandBus.execute(new HoldBalanceForPayoutCommand(payoutId));
        }
    }
}
