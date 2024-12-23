import { Controller, UseGuards, Get, Param, Query, Patch, Post, Body } from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags, ApiParam, ApiOperation } from '@nestjs/swagger';
import { Crud, CrudController, ParsedRequest, Override, CrudRequest, ParsedBody, GetManyDefaultResponse } from '@nestjsx/crud';
import * as moment from 'moment';
import { CustomApiHeaders } from '@shared/decorators';
import { Priority } from '@shared/enums';
import { FindAndPatchCRMCustomerIdCommand } from '@service-request/commands/find-and-patch-crm-customer-id.command';
import { RefundInput } from '../refund/refund.dto';
import { ServiceRequestUpdateInput } from './dto/service-request-update.input';
import { ServiceRequestDto } from './dto/service-request.dto';
import { ServiceAllocationStatusEnum } from './entities/service-allocation-status.enum';
import { ServiceRequest } from './entities/service-request.entity';
import { ServiceStatusEnum } from './entities/service-status.enum';
import { ServiceRequestService } from './service-request.service';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';
import { HandlingEvent } from 'handling/entities/handling-event.entity';
import { GetHandlingEventsOfServiceRequestQuery } from 'handling/queries/get-handling-events-of-service-request.query';

@ApiTags('admin-service-request')
@CustomApiHeaders()
@Controller('admin/service-requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Crud({
    model: {
        type: ServiceRequest,
    },
    params: {
        id: {
            field: 'id',
            primary: true,
            type: 'string',
        },
    },
    routes: {
        exclude: ['createOneBase', 'createManyBase', 'replaceOneBase'],
    },
    query: {
        join: {
            refund: {
                eager: false,
            },
        },
    },
})
export class AdminServiceRequestController implements CrudController<ServiceRequest> {
    constructor(private readonly queryBus: QueryBus, private readonly commandBus: CommandBus, public readonly service: ServiceRequestService) {}

    get base(): CrudController<ServiceRequest> {
        return this;
    }

    @Override()
    async updateOne(@ParsedRequest() req: CrudRequest, @ParsedBody() input: ServiceRequestUpdateInput): Promise<ServiceRequestDto> {
        const id = req.parsed.paramsFilter[0].value;
        const sr = await this.service.adminChangeSpecification(id, input);
        return sr.toDto();
    }

    @Override()
    async getOne(@ParsedRequest() req: CrudRequest): Promise<ServiceRequestDto> {
        const serviceRequest = await this.service.readOne(req);
        return serviceRequest.toDto();
    }

    @Override()
    async getMany(
        @ParsedRequest() req: CrudRequest,
        @Query('priority') priority: string,
    ): Promise<GetManyDefaultResponse<ServiceRequestDto> | ServiceRequestDto[]> {
        const parsedPriority = Priority[priority?.toUpperCase()];
        if (parsedPriority === Priority.HIGH) {
            req.parsed.search.$and.push({
                'ServiceRequest.start': {
                    $lte: moment()
                        .add(6, 'h')
                        .toISOString(),
                },
            });
            req.parsed.search.$and.push({
                'ServiceRequest.allocationStatus': {
                    $eq: ServiceAllocationStatusEnum.UNASSIGNED,
                },
            });
            req.parsed.search.$and.push({
                'ServiceRequest.status': {
                    $notin: [
                        ServiceStatusEnum.CANCELLED_BY_OPERATOR,
                        ServiceStatusEnum.CANCELLED_BY_SERVICE_PROVIDER,
                        ServiceStatusEnum.CANCELLED_BY_CUSTOMER,
                    ],
                },
            });
        }
        const serviceRequests: GetManyDefaultResponse<ServiceRequest> | ServiceRequest[] = await this.base.getManyBase(req);
        if ('data' in serviceRequests) {
            const paginated = {} as GetManyDefaultResponse<ServiceRequestDto>;
            paginated.data = serviceRequests.data.map(sr => sr.toDto());
            paginated.count = serviceRequests.count;
            paginated.page = serviceRequests.page;
            paginated.pageCount = serviceRequests.pageCount;
            paginated.total = serviceRequests.total;
            return paginated;
        }

        return serviceRequests.map(sr => sr.toDto());
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all events of the Service Request' })
    @ApiParam({ name: 'id' })
    @Get(':id/events')
    @UseGuards(JwtAuthGuard)
    getEventsOfServiceRequest(@Param('id') id: string): Promise<HandlingEvent> {
        return this.queryBus.execute(new GetHandlingEventsOfServiceRequestQuery(id));
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Patch failed sync Service Request to CRM' })
    @ApiParam({ name: 'id' })
    @Patch(':id/patch-crm')
    @UseGuards(JwtAuthGuard)
    syncCrm(@Param('id') id: string): Promise<void> {
        return this.commandBus.execute(new FindAndPatchCRMCustomerIdCommand(id));
    }

    @ApiOperation({ summary: 'Trigger refund for Service Request' })
    @ApiParam({ name: 'id' })
    @Post(':id/refund')
    async refund(@Param('id') id: string, @Body() input: RefundInput): Promise<ServiceRequestDto> {
        const sr = await this.service.refund(id, input);
        return sr.toDto();
    }
}
