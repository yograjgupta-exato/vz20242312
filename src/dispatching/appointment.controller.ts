import { Controller, UseGuards, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import * as moment from 'moment';
import { CurrentUser, CustomApiHeaders } from '@shared/decorators';
import { AppointmentSummaryDto } from './dto/appointment-summary.dto';
import { AppointmentDto } from './dto/appointment.dto';
import { GetAppointmentsByDateQuery } from './queries/get-appointments-by-date.query';
import { GetMonthlyAppointmentSummaryQuery } from './queries/get-monthly-appointment-summary.query';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';

@ApiTags('appointment')
@CustomApiHeaders()
@Controller('appointments')
export class AppointmentController {
    constructor(private readonly queryBus: QueryBus) {}

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get appointments.' })
    @ApiQuery({
        description: "format(YYYY-MM-DD). If left empty, default to today's date",
        example: moment().format('YYYY-MM-DD'),
        name: 'date',
        required: false,
    })
    @Get('')
    @UseGuards(JwtAuthGuard)
    getDailyAppointments(@CurrentUser('sub') providerId: string, @Query('date') date: string): Promise<AppointmentDto[]> {
        return this.queryBus.execute(new GetAppointmentsByDateQuery(providerId, date));
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get monthly appointment summary.' })
    @ApiQuery({
        name: 'month',
        description: 'Months are zero indexed, so January is month 0. If left empty, default to current month.',
        required: false,
    })
    @Get('summary')
    @UseGuards(JwtAuthGuard)
    getMonthlyAppointmentSummary(@CurrentUser('sub') providerId: string, @Query('month') month?: number): Promise<AppointmentSummaryDto[]> {
        return this.queryBus.execute(new GetMonthlyAppointmentSummaryQuery(providerId, month));
    }
}
