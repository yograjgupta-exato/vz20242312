import { UseGuards, Body, Controller, Put, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import * as moment from 'moment';
import { CurrentUser, CustomApiHeaders, Pagination, PAGE_QUERY_METADATA, LIMIT_QUERY_METADATA, IPagination } from '@shared/decorators';
import { ReportFrequency } from '@shared/enums/report-frequency';
import { GetJobSummaryQuery } from '@service-request/queries/get-job-summary.query';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EarningSummaryDto } from '../wallet/dtos/earning-summary.dto';
import { EarningInput } from '../wallet/dtos/earning.input';
import { GetEarningSummaryQuery } from '../wallet/queries/get-earning-summary.query';
import { GetPaginatedTransactionsQuery } from '../wallet/queries/get-paginated-transactions.query';
import { JobSummaryDto } from './dto/job-summary.dto';
import { LatLngDto } from './dto/lat-lng.dto';
import { ServiceProviderService } from './service-provider.service';

@ApiTags('me')
@CustomApiHeaders()
@Controller('me')
export class MeController {
    constructor(public service: ServiceProviderService, private readonly queryBus: QueryBus) { }

    @ApiBearerAuth()
    @Put('location')
    @UseGuards(JwtAuthGuard)
    updateLocation(@CurrentUser('sub') providerId: string, @Body() input: LatLngDto) {
        return this.service.updateLocation(providerId, input);
    }

    @ApiBearerAuth()
    @Put('onduty')
    @UseGuards(JwtAuthGuard)
    onDuty(@CurrentUser('sub') providerId: string, @Body() input: LatLngDto) {
        return this.service.onDuty(providerId, input);
    }

    @ApiBearerAuth()
    @Put('offduty')
    @UseGuards(JwtAuthGuard)
    offDuty(@CurrentUser('sub') providerId: string, @Body() input: LatLngDto) {
        return this.service.offDuty(providerId, input);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get job summary.' })
    @ApiQuery({
        description: 'Frequency of the job summary.',
        example: 'WEEKLY',
        name: 'frequency',
        enum: [ReportFrequency.WEEKLY, ReportFrequency.MONTHLY],
        required: false,
    })
    @ApiQuery({
        description: "format(YYYY-MM-DD). If left empty, default to today's date",
        example: moment().format('YYYY-MM-DD'),
        name: 'date',
        required: false,
    })
    @Get('summary')
    @UseGuards(JwtAuthGuard)
    async summary(
        @CurrentUser('sub') providerId: string,
        @Query('frequency') frequency?: ReportFrequency,
        @Query('date') date?: string,
    ): Promise<JobSummaryDto> {
        return this.queryBus.execute(new GetJobSummaryQuery(providerId, frequency, date));
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get earning summary.' })
    @Get('earnings')
    @UseGuards(JwtAuthGuard)
    async getEarnings(@CurrentUser('sub') providerId: string, @Query() input: EarningInput): Promise<EarningSummaryDto[]> {
        return this.queryBus.execute(new GetEarningSummaryQuery(providerId, input));
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get transaction list.' })
    @Get('transactions')
    @UseGuards(JwtAuthGuard)
    @ApiQuery(PAGE_QUERY_METADATA)
    @ApiQuery(LIMIT_QUERY_METADATA)
    async indexTransactions(@CurrentUser('sub') providerId: string, @Pagination() pagination: IPagination) {
        return this.queryBus.execute(new GetPaginatedTransactionsQuery(providerId, pagination));
    }
}
