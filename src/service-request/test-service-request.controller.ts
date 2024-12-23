import { Post, Controller, Param, UseGuards, Body } from '@nestjs/common';
import { QueryBus, EventBus, CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import {
    ServiceRequestConfirmedEvent,
    ServiceRequestCreatedEvent,
    ServiceRequestFulfilledEvent,
    ServiceRequestWorkCommencedEvent,
} from '@cqrs/events/service-request.event';
import { EntityNotFoundError } from '@shared/errors';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InitiateAutoAssignmentCommand } from '../dispatching/commands/initiate-auto-assignment.command';
import { EmailNotifyCustomerRescheduledCommand } from '../email/commands/email-notify-customer-rescheduled.command';
import { ServiceRequest } from './entities/service-request.entity';
import { IServiceRequest } from './interfaces/service-request.interface';
import { GetServiceRequestQuery } from './queries/get-service-request.query';
import { ServiceRequestService } from './service-request.service';

export class TestRescheduleEmailDto {
    @ApiProperty({
        description: 'Mocked recipient email-address. Leave it as blank to use original email recipient',
        example: 'cchitsiang@hotmail.com',
    })
    mockRecipientEmail: string;
}

@ApiTags('test')
@Controller('test')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TestServiceRequestController {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly service: ServiceRequestService,
    ) {}

    @Post('service-requests/:id/created')
    async testServiceRequestCreated(@Param('id') id: string) {
        const serviceRequest: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(id));
        if (!serviceRequest) {
            throw new EntityNotFoundError('ServiceRequest', id);
        }
        this.eventBus.publish(new ServiceRequestCreatedEvent(serviceRequest as any));
    }

    @Post('service-requests/:id/confirmed')
    async testServiceRequestConfirmed(@Param('id') id: string) {
        const serviceRequest: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(id));
        if (!serviceRequest) {
            throw new EntityNotFoundError('ServiceRequest', id);
        }
        this.eventBus.publish(new ServiceRequestConfirmedEvent(serviceRequest, false));
    }

    @Post('service-requests/:id/fulfilled')
    async testServiceRequestFulfilled(@Param('id') id: string) {
        const serviceRequest: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(id));
        if (!serviceRequest) {
            throw new EntityNotFoundError('ServiceRequest', id);
        }
        this.eventBus.publish(new ServiceRequestFulfilledEvent(serviceRequest));
    }

    @Post('service-requests/:id/dispatching')
    async testServiceRequestDispatching(@Param('id') id: string) {
        const serviceRequest: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(id));
        if (!serviceRequest) {
            throw new EntityNotFoundError('ServiceRequest', id);
        }
        await this.commandBus.execute(new InitiateAutoAssignmentCommand(id));
    }

    @Post('service-requests/:id/work-commenced')
    async testServiceRequestWorkCommenced(@Param('id') id: string) {
        const serviceRequest: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(id));
        if (!serviceRequest) {
            throw new EntityNotFoundError('ServiceRequest', id);
        }
        this.eventBus.publish(new ServiceRequestWorkCommencedEvent(serviceRequest));
    }

    @Post('service-requests/patch-pricing-discrepancy-with-applied-promo-code')
    async patchPricingDiscrepancyWithAppliedPromoCode(): Promise<ServiceRequest[]> {
        return this.service.patchPricingDiscrepancyWithAppliedPromoCode();
    }

    @Post('service-requests/:id/email/reschedule')
    async testRescheduleEmail(@Param('id') id: string, @Body() input: TestRescheduleEmailDto) {
        const serviceRequest: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(id));
        if (!serviceRequest) {
            throw new EntityNotFoundError('ServiceRequest', id);
        }
        await this.commandBus.execute(new EmailNotifyCustomerRescheduledCommand(serviceRequest.toDto(), input.mockRecipientEmail));
    }
}
