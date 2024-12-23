import { Controller, Post, Param } from '@nestjs/common';
import { EventBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ServiceRequestFulfilledEvent } from '@cqrs/events/service-request.event';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { GetServiceRequestQuery } from '@service-request/queries/get-service-request.query';

@ApiTags('wallets')
@Controller('earnings')
export class EarningController {
    constructor(private readonly eventBus: EventBus, private readonly queryBus: QueryBus) {}

    // test add earning
    @ApiOperation({ summary: 'Test adding earnings.' })
    @Post('/test/:serviceRequestId')
    async addEarning(@Param('serviceRequestId') id: string) {
        const serviceRequest: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(id));
        this.eventBus.publish(new ServiceRequestFulfilledEvent(serviceRequest));
    }
}
