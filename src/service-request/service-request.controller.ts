import { Controller, Body, Post, UseGuards, Get, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { In } from 'typeorm';
import { AppConfigService } from '@shared/config';
import { HEADER_OTP_TOKEN } from '@shared/constants';
import { CustomApiHeaders, Pagination, IPagination, PAGE_QUERY_METADATA, LIMIT_QUERY_METADATA } from '@shared/decorators';
import { BadRequestError } from '@shared/errors';
import { ParsePhoneNumberPipe } from '@shared/pipes';
import { PaymentCheckoutInfoDto } from '@payment/dtos/payment-checkout-info.dto';
import { GetIPay88PaymentCheckoutInfoQuery } from '@payment/queries/get-ipay88-payment-checkout-info.query';
import { isDevMode, isProdMode } from '../app.environment';
import { OtpTokenGuard } from '../auth/guards/otp-token.guard';
import { PaymentPurposeCode } from '../shared/enums/payment-purpose-code';
import { CheckoutServiceRequestDto } from './dto/checkout-service-request.dto';
import { PeriodInput } from './dto/period.input';
import { ServiceRequestDto } from './dto/service-request.dto';
import { ServiceRequestInput } from './dto/service-request.input';
import { ServiceStatusEnum } from './entities/service-status.enum';
import { ServiceRequestService } from './service-request.service';

@ApiTags('service-request')
@CustomApiHeaders()
@Controller('service-requests')
export class ServiceRequestController {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly service: ServiceRequestService,
        private readonly configService: AppConfigService,
    ) {}

    @Post()
    @ApiHeader({
        name: HEADER_OTP_TOKEN,
        required: isProdMode,
    })
    @UseGuards(OtpTokenGuard)
    async createOne(
        @Body(new ParsePhoneNumberPipe(['customerContact.phone', 'customerContact.secondaryPhone'])) input: ServiceRequestInput,
    ): Promise<CheckoutServiceRequestDto> {
        if (!input.externalCustomerId && isDevMode) {
            input.externalCustomerId = 'f660080f-e825-4f00-bbbf-89895d746ad3';
        }
        const sr = await this.service.create(input);
        const paymentCheckoutInfoDto: PaymentCheckoutInfoDto = this.configService.serviceRequestOptions.paymentGatewayEnabled
            ? await this.queryBus.execute(new GetIPay88PaymentCheckoutInfoQuery(sr.getId(), PaymentPurposeCode.FEE))
            : null;
        return CheckoutServiceRequestDto.from(sr.toDto(), paymentCheckoutInfoDto);
    }

    @Post('calculate')
    async calculate(
        @Body(new ParsePhoneNumberPipe(['customerContact.phone', 'customerContact.secondaryPhone'])) input: ServiceRequestInput,
    ): Promise<CheckoutServiceRequestDto> {
        if (!input.externalCustomerId && isDevMode) {
            input.externalCustomerId = 'f660080f-e825-4f00-bbbf-89895d746ad3';
        }
        const sr = await this.service.calculate(input, false);
        return sr.toDto();
    }

    @Get()
    @ApiQuery(PAGE_QUERY_METADATA)
    @ApiQuery(LIMIT_QUERY_METADATA)
    async indexServiceRequests(@Pagination() pagination: IPagination, @Query('ownerId') ownerId: string) {
        if (isProdMode && !ownerId) {
            throw new BadRequestError();
        }
        const status = In([
            ServiceStatusEnum.AWAITING_PAYMENT,
            ServiceStatusEnum.ASSIGNED,
            ServiceStatusEnum.UNASSIGNED,
            ServiceStatusEnum.ALLOCATED,
            ServiceStatusEnum.STARTED,
            ServiceStatusEnum.IN_PROGRESS,
            ServiceStatusEnum.CANCELLED_BY_SERVICE_PROVIDER,
            ServiceStatusEnum.CANCELLED_BY_OPERATOR,
        ]);
        return this.service.findWithPagination({ ownerId, pagination, status });
    }

    @Get('history')
    @ApiQuery(PAGE_QUERY_METADATA)
    @ApiQuery(LIMIT_QUERY_METADATA)
    async indexHistoricalServiceRequests(@Pagination() pagination: IPagination, @Query('ownerId') ownerId: string) {
        if (!ownerId) {
            throw new BadRequestError();
        }
        const status = In([
            ServiceStatusEnum.FULFILLED,
            ServiceStatusEnum.FAILED,
            ServiceStatusEnum.CANCELLED_BY_CUSTOMER,
            ServiceStatusEnum.FAILED_PAYMENT,
        ]);
        return this.service.findWithPagination({ ownerId, pagination, status });
    }

    @Get(':id')
    async getOne(@Param('id') id: string): Promise<ServiceRequestDto> {
        const serviceRequest = await this.service.get(id);
        return serviceRequest.toDto();
    }

    @Get(':id/checkout')
    async checkout(@Param('id') id: string): Promise<PaymentCheckoutInfoDto> {
        const serviceRequest = await this.service.get(id);

        if (serviceRequest.service.status === ServiceStatusEnum.AWAITING_PAYMENT) {
            const paymentCheckoutInfoDto: PaymentCheckoutInfoDto = this.configService.serviceRequestOptions.paymentGatewayEnabled
                ? await this.queryBus.execute(new GetIPay88PaymentCheckoutInfoQuery(serviceRequest.getId(), PaymentPurposeCode.FEE))
                : null;

            return paymentCheckoutInfoDto;
        }

        throw new BadRequestError();
    }

    @Post(':id/cancel')
    async cancel(@Param('id') id: string): Promise<ServiceRequestDto> {
        const serviceRequest = await this.service.cancel(id);
        return serviceRequest.toDto();
    }

    @Post(':id/reschedule')
    async reschedule(@Param('id') id: string, @Body() input: PeriodInput): Promise<CheckoutServiceRequestDto> {
        return this.service.reschedule(id, input);
    }
}
