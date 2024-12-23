import { Body, Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PAGE_QUERY_METADATA, LIMIT_QUERY_METADATA, Pagination, IPagination } from '../shared/decorators';
import { UpdatePayoutCommand } from './commands/update-payout.command';
import { UpdatePayoutDto } from './dtos/update-payout.dto';
import { IPayout } from './interfaces/payout.interface';
import { FindPayoutsQuery } from './queries/find-payouts.query';
import { GetPayoutQuery } from './queries/get-payout.query';

@ApiTags('admin-payout')
@Controller('admin/payouts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payouts')
export class AdminPayoutController {
    constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

    @Get()
    @ApiQuery(PAGE_QUERY_METADATA)
    @ApiQuery(LIMIT_QUERY_METADATA)
    @ApiQuery({
        name: 'serviceGroup',
        required: false,
    })
    @ApiQuery({
        name: 'status',
        required: false,
    })
    @ApiQuery({
        name: 'id',
        required: false,
    })
    async indexPayouts(
        @Pagination() pagination: IPagination,
        @Query('serviceGroup') serviceGroup?: string,
        @Query('status') status?: string,
        @Query('id') id?: string,
    ) {
        return this.queryBus.execute(
            new FindPayoutsQuery(pagination, {
                serviceGroup,
                status,
                id,
            }),
        );
    }

    @Get(':id')
    async getOne(@Param('id') id: string): Promise<IPayout> {
        return this.queryBus.execute(new GetPayoutQuery(id));
    }

    @Put(':id')
    async updateOne(@Param('id') id: string, @Body() input: UpdatePayoutDto): Promise<IPayout> {
        await this.commandBus.execute(new UpdatePayoutCommand(id, input));
        return this.getOne(id);
    }
}
