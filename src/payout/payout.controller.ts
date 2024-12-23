import { Body, Controller, Param, ParseArrayPipe, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { GenerateTestWalletTransactionsCommand } from '@wallet/commands/generate-test-wallet-transactions.command';
// eslint-disable-next-line max-len
import { RegenMissingWalletTransactionsFromFulfilledServiceRequestsCommand } from '@wallet/commands/regen-missing-wallet-transactions-from-fulfilled-service-requests.command';
import { MarkPayoutLinesAsPaidInput } from './dtos/payout-lines.input';
import { PayoutService } from './payout.service';

@ApiTags('payout')
@Controller('payouts')
export class PayoutController {
    constructor(private readonly service: PayoutService, private readonly commandBus: CommandBus) {}

    @Post('/test-ftp-connection')
    async testFtpConnection() {
        return this.service.testFtpConnection();
    }

    @ApiOperation({ summary: '(generate wallet transactions).' })
    @Post('/test-gen-wallet-trans/:serviceRequestId')
    async testGenWalletTransFromWalletTrans(@Param('serviceRequestId') serviceRequestId: string) {
        return this.commandBus.execute(new GenerateTestWalletTransactionsCommand(serviceRequestId));
    }

    @ApiOperation({ summary: '(regenerate missing wallet transactions from fulfilled service requests).' })
    @Post('/regen-missing-wallet-trans')
    async regenMissingWalletTrans() {
        return this.commandBus.execute(new RegenMissingWalletTransactionsFromFulfilledServiceRequestsCommand());
    }

    @ApiOperation({ summary: 'Settlements map step: (schedule payouts).' })
    @Post('/test-schedule-payouts-from-wallet-trans')
    async testSchedulePayoutsFromWalletTrans() {
        return this.service.schedulePayoutsFromWalletTransactions();
    }

    @ApiOperation({ summary: 'Settlements reduce step: (generate bank files).' })
    @Post('/test-gen-and-upload-payment-files-from-payouts')
    async testGenAndUploadPaymentFiles() {
        return this.service.generateAndUploadPaymentFiles();
    }

    @ApiOperation({ summary: 'simulation: mark every in-transit payout batches as paid' })
    @Post('/mark-every-in-transit-payout-batches-as-paid')
    async markEveryInTransitPayoutBatchesAsPaid() {
        return this.service.markEveryInTransitPayoutBatchesAsPaid();
    }

    @ApiOperation({ summary: 'simulation: mark in-transit payout lines as paid' })
    @ApiBody({ type: MarkPayoutLinesAsPaidInput, isArray: true })
    @Post('/mark-payout-lines-as-paid')
    async markPayoutLinesAsPaid(@Body(new ParseArrayPipe({ items: MarkPayoutLinesAsPaidInput })) inputs: MarkPayoutLinesAsPaidInput[]) {
        await this.service.markPayoutLinesAsPaidInBulk(inputs);
    }

    @ApiOperation({ summary: 'patch: missing payout transactions due to cron + saga' })
    @Post('/patch-missing-payout-transactions')
    async patchMissingPayoutTransactions() {
        await this.service.patchMissingPayoutTransactions();
    }
}
