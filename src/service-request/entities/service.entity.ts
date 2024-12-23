import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, ManyToOne } from 'typeorm';
import { OptPeriod } from '@shared/entities/opt-period.entity';
import { Period } from '@shared/entities/period.entity';
import { PaymentGatewayResponseStatus } from '@shared/enums/payment-gateway-response-status';
import { NextServiceActionTypeDto } from '@service-request/dto/next-service-action-type.dto';
import { ServiceStatusDto } from '@service-request/dto/service-status.dto';
import { ServiceActionTypeEnum } from '@service-request/enums/service-action-type.enum';
import { PaymentGatewayResponseHistory } from '@payment/entities/payment-gateway-response-history.entity';
import { PaymentGatewayResponse } from '@payment/entities/payment-gateway-response.entity';
import { HandlingEvent } from '../../handling/entities/handling-event.entity';
import { HandlingHistory } from '../../handling/entities/handling-history.entity';
import { HandlingEventTypeEnum } from '../../handling/enums/handling-event-type.enum';
import { Agent } from './agent.entity';
import { ProviderFactory } from './factories/provider.factory';
import { Provider } from './provider.entity';
import { Schedule } from './schedule.entity';
import { ServiceAllocationStatusEnum } from './service-allocation-status.enum';
import { ServiceStatusEnum } from './service-status.enum';
import { IServiceProvider } from 'service-provider/interfaces/service-provider.interface';

export class Service {
    @Column({
        name: '_allocation_status',
        default: ServiceAllocationStatusEnum.UNASSIGNED,
        enum: ServiceAllocationStatusEnum,
        type: 'enum',
    })
    allocationStatus: ServiceAllocationStatusEnum;

    @ManyToOne(() => HandlingEvent, {
        eager: true,
        nullable: true,
    })
    lastEvent?: HandlingEvent;

    @ManyToOne(() => PaymentGatewayResponse, {
        eager: true,
        nullable: true,
    })
    lastCustomerPaymentGatewayResponse?: PaymentGatewayResponse;

    @Column({
        default: PaymentGatewayResponseStatus.AWAITING_PAYMENT,
        enum: PaymentGatewayResponseStatus,
        name: '_payment_status',
        type: 'enum',
    })
    paymentStatus: PaymentGatewayResponseStatus;

    @Column({
        default: true,
        name: '_is_prepaid',
    })
    isPrepaid: boolean;

    @ApiProperty({
        description: 'The next service action type.',
    })
    @Column({
        name: '_next_action_type',
        default: ServiceActionTypeEnum.REQUEST_JOB,
        enum: ServiceActionTypeEnum,
        type: 'enum',
    })
    nextActionType: ServiceActionTypeEnum;

    @ApiProperty({
        description: 'The status of the service event.',
    })
    @Column({
        name: '_status',
        default: ServiceStatusEnum.UNASSIGNED,
        enum: ServiceStatusEnum,
        type: 'enum',
    })
    status: ServiceStatusEnum;

    @ApiProperty({
        description: 'An allocated worker by an assigned dispatcher.',
    })
    @Column(() => Provider)
    provider: Provider;

    @ApiPropertyOptional({
        description: 'Internal remarks of service',
    })
    @Column({
        name: '_remarks',
        nullable: true,
    })
    remarks?: string;

    @Column({
        name: '_eligible_for_refund',
        default: false,
    })
    eligibleForRefund: boolean;

    @Column({
        default: false,
        name: '_is_refunded',
    })
    isRefunded: boolean;

    private constructor(
        lastEvent: HandlingEvent,
        provider: Provider,
        lastCustomerPaymentGatewayResponse: PaymentGatewayResponse,
        isPrepaid: boolean,
        cancellationStatus?:
            | ServiceStatusEnum.CANCELLED_BY_OPERATOR
            | ServiceStatusEnum.CANCELLED_BY_SERVICE_PROVIDER
            | ServiceStatusEnum.CANCELLED_BY_CUSTOMER
            | ServiceStatusEnum.FAILED,
    ) {
        // refactor(roy): constructor shouldn't do this
        // Note: Why we need this?
        if (lastEvent === undefined && provider === undefined && lastCustomerPaymentGatewayResponse === undefined) {
            return;
        }
        this.lastEvent = lastEvent;
        this.provider = provider;
        this.isPrepaid = isPrepaid;
        this.lastCustomerPaymentGatewayResponse = lastCustomerPaymentGatewayResponse;
        this.paymentStatus = lastCustomerPaymentGatewayResponse?.responseStatus ?? PaymentGatewayResponseStatus.AWAITING_PAYMENT;
        this.allocationStatus = this.calculateAllocationStatus();
        this.status = cancellationStatus ? cancellationStatus : this.calculateStatus();
        this.nextActionType = this.calculateNextActionType();
    }

    public static derivedFrom(
        handlingHistory: HandlingHistory,
        provider: Provider,
        paymentGatewayResponseHistory: PaymentGatewayResponseHistory,
        isPrepaid: boolean,
    ): Service {
        const lastEvent: HandlingEvent = handlingHistory.mostRecentlyCompletedEvent();
        const lastResponse: PaymentGatewayResponse = paymentGatewayResponseHistory.mostRecentResponse();

        return new Service(lastEvent, provider, lastResponse, isPrepaid);
    }

    public derivedFromHandlingHistory(handlingHistory: HandlingHistory): Service {
        const lastEvent: HandlingEvent = handlingHistory.mostRecentlyCompletedEvent();

        return new Service(lastEvent, this.provider, this.lastCustomerPaymentGatewayResponse, this.isPrepaid);
    }

    public derivedFromPaymentGatewayResponseHistory(paymentGatewayResponseHistory: PaymentGatewayResponseHistory): Service {
        const lastResponse: PaymentGatewayResponse = paymentGatewayResponseHistory.mostRecentResponse();
        return new Service(this.lastEvent, this.provider, lastResponse, this.isPrepaid);
    }

    /**
     * Rebuild service without `status` and `lastEvent`. However, `paymentHistory` preserved.
     * @returns Service
     */
    public restart(): Service {
        return new Service(null, null, this.lastCustomerPaymentGatewayResponse, this.isPrepaid);
    }

    // refactor(roy): should the schedule comes from dealer ?
    public assignToDispatcher(dispatcher: IServiceProvider): Service {
        return new Service(
            this.lastEvent,
            ProviderFactory.create(
                new Agent(dispatcher.getId(), dispatcher.getName(), dispatcher.getPhone(), dispatcher.getProfilePicture()),
                null,
                null,
            ),
            this.lastCustomerPaymentGatewayResponse,
            this.isPrepaid,
        );
    }

    // refactor(roy): should the schedule comes from dealer ?
    public allocateToWorker(worker: IServiceProvider, period: Period): Service {
        // refactor(roy): schedule factory?
        const schedule = new Schedule();
        const optPeriod = new OptPeriod();
        optPeriod.start = period.start;
        optPeriod.end = period.end;
        schedule.period = optPeriod;

        return new Service(
            this.lastEvent,
            ProviderFactory.create(
                this.provider?.dispatcher,
                new Agent(worker.getId(), worker.getName(), worker.getPhone(), worker.getProfilePicture()),
                schedule,
            ),
            this.lastCustomerPaymentGatewayResponse,
            this.isPrepaid,
        );
    }

    private terminateProvider(
        cancellationStatus?:
            | ServiceStatusEnum.CANCELLED_BY_OPERATOR
            | ServiceStatusEnum.CANCELLED_BY_SERVICE_PROVIDER
            | ServiceStatusEnum.CANCELLED_BY_CUSTOMER
            | ServiceStatusEnum.FAILED,
    ): Service {
        return new Service(
            this.lastEvent,
            ProviderFactory.createEmptyProvider(),
            this.lastCustomerPaymentGatewayResponse,
            this.isPrepaid,
            cancellationStatus,
        );
    }

    private markFailed(): Service {
        return new Service(this.lastEvent, this.provider, this.lastCustomerPaymentGatewayResponse, this.isPrepaid, ServiceStatusEnum.FAILED);
    }

    public cancel(provider: IServiceProvider): Service {
        if (!provider) {
            throw new Error('Provider not found');
        }

        if (!this.isAssignedOrAllocatedTo(provider.getId())) {
            throw new Error('Job is not assigned/allocated to you');
        }

        if (provider.isWorker()) {
            throw new Error('Job should not be cancelled by worker');
        }

        if (this.hasBeenCancelled()) {
            throw new Error('Job has already been cancelled');
        }

        if (this.hasBeenFulfilled()) {
            throw new Error('Job has been completed, unable to cancel');
        }

        return this.terminateProvider(ServiceStatusEnum.CANCELLED_BY_SERVICE_PROVIDER);
    }

    public cancelByCustomer(): Service {
        return this.terminateProvider(ServiceStatusEnum.CANCELLED_BY_CUSTOMER);
    }

    public revoke(markAsFailed: boolean): Service {
        return markAsFailed ? this.markFailed() : this.terminateProvider(ServiceStatusEnum.CANCELLED_BY_OPERATOR);
    }

    public reschedule(): Service {
        return this.terminateProvider();
    }

    public expiredBySystem(): Service {
        const service = new Service(null, ProviderFactory.createEmptyProvider(), this.lastCustomerPaymentGatewayResponse, this.isPrepaid);
        service.paymentStatus = PaymentGatewayResponseStatus.FAILED;
        service.status = ServiceStatusEnum.FAILED_PAYMENT;
        service.remarks = 'Marked as expired by system';
        return service;
    }

    private calculateAllocationStatus(): ServiceAllocationStatusEnum {
        // overly simplify example, we can call service-status-fsm here for state transition.
        // we can even inspect down to provider.schedule | provider.dispatcher, provider.worker
        // return ServiceAllocationStatusEnum.ASSIGNED;
        let status = ServiceAllocationStatusEnum.UNASSIGNED;
        if (!this.provider) {
            return status;
        }

        switch (true) {
            case !this.provider.dispatcher && !this.provider.worker:
                status = ServiceAllocationStatusEnum.UNASSIGNED;
                break;
            case !!this.provider.dispatcher?.id && !this.provider.worker?.id:
                status = ServiceAllocationStatusEnum.ASSIGNED;
                break;
            case !!this.provider.dispatcher?.id && !!this.provider.worker?.id:
                status = ServiceAllocationStatusEnum.ALLOCATED;
                break;

            default:
                break;
        }

        return status;
    }

    private calculateStatus(): ServiceStatusEnum {
        if (this.hasBeenCancelled()) {
            return this.status;
        }

        // note(roy): !this.hasBeenStarted() is to migrate old service-request data
        // if it's already started, let it be - don't check for payment status anymore.
        if (this.isPrepaid && !this.hasBeenStarted()) {
            switch (this.paymentStatus) {
                case PaymentGatewayResponseStatus.AWAITING_PAYMENT:
                    return ServiceStatusEnum.AWAITING_PAYMENT;
                case PaymentGatewayResponseStatus.FAILED:
                    return ServiceStatusEnum.AWAITING_PAYMENT;
                default:
                    break;
            }
        }

        if (!this.hasBeenStarted()) {
            switch (this.allocationStatus) {
                case ServiceAllocationStatusEnum.UNASSIGNED:
                    return ServiceStatusEnum.UNASSIGNED;
                case ServiceAllocationStatusEnum.ASSIGNED:
                    return ServiceStatusEnum.ASSIGNED;
                case ServiceAllocationStatusEnum.ALLOCATED:
                    return ServiceStatusEnum.ALLOCATED;
                default:
                    return ServiceStatusEnum.UNASSIGNED;
            }
        }

        switch (this.lastEvent.type) {
            case HandlingEventTypeEnum.START:
                return ServiceStatusEnum.STARTED;
            case HandlingEventTypeEnum.IN_PROGRESS:
                return ServiceStatusEnum.IN_PROGRESS;
            case HandlingEventTypeEnum.FULLFIL:
                return ServiceStatusEnum.FULFILLED;
            default:
                return ServiceStatusEnum.STARTED;
        }
    }

    // todo(roy): incomplete, missing worker allocation
    // note(roy): handling-event + service-status
    private calculateNextActionType(): ServiceActionTypeEnum {
        if (this.hasBeenCancelled()) {
            return ServiceActionTypeEnum.IDLE;
        }

        if (!this.hasBeenAssignedOrAllocated()) {
            return ServiceActionTypeEnum.REQUEST_JOB;
        }

        if (this.hasBeenAssignedButNotAllocated()) {
            return ServiceActionTypeEnum.ALLOCATE_WORKER;
        }

        switch (this.status) {
            case ServiceStatusEnum.ALLOCATED:
                return ServiceActionTypeEnum.START;
            case ServiceStatusEnum.STARTED:
                return ServiceActionTypeEnum.IN_PROGRESS;
            case ServiceStatusEnum.IN_PROGRESS:
                return ServiceActionTypeEnum.FULLFIL;
            default:
                return ServiceActionTypeEnum.FULLFIL;
        }
    }

    public toNextServiceActionTypeDto(): NextServiceActionTypeDto {
        const s = new NextServiceActionTypeDto();
        s.code = this.nextActionType;

        switch (this.nextActionType) {
            case ServiceActionTypeEnum.REQUEST_JOB:
                s.name = 'Request Job';
                break;
            case ServiceActionTypeEnum.ALLOCATE_WORKER:
                s.name = 'Allocate Worker';
                break;
            case ServiceActionTypeEnum.START:
                s.name = 'Travel';
                break;
            case ServiceActionTypeEnum.IN_PROGRESS:
                s.name = 'Start Job';
                break;
            case ServiceActionTypeEnum.FULLFIL:
                s.name = 'Complete Job';
                break;
            default:
                s.name = this.nextActionType.toString();
                break;
        }
        return s;
    }

    // refactor(roy): consider put dto out of entity layer.
    public toServiceStatusDto(): ServiceStatusDto {
        const s = new ServiceStatusDto();
        s.code = this.status;
        switch (s.code) {
            case ServiceStatusEnum.AWAITING_PAYMENT:
                s.name = 'Awaiting Payment';
                return s;
            case ServiceStatusEnum.FAILED_PAYMENT:
                s.name = 'Payment Failed';
                return s;
            case ServiceStatusEnum.UNASSIGNED:
                s.name = 'Open';
                break;
            case ServiceStatusEnum.ASSIGNED:
                s.name = 'Accepted';
                break;
            case ServiceStatusEnum.ALLOCATED:
                s.name = 'Allocated';
                break;
            case ServiceStatusEnum.STARTED:
                s.name = 'Traveling';
                break;
            case ServiceStatusEnum.IN_PROGRESS:
                s.name = 'Job Started';
                break;
            case ServiceStatusEnum.FULFILLED:
                s.name = 'Job Completed';
                break;
            case ServiceStatusEnum.CANCELLED_BY_SERVICE_PROVIDER:
                s.name = 'Cancelled By Service Provider';
                break;
            case ServiceStatusEnum.CANCELLED_BY_OPERATOR:
                s.name = 'Cancelled By Operator';
                break;
            case ServiceStatusEnum.CANCELLED_BY_CUSTOMER:
                s.name = 'Cancelled By Customer';
                break;
            default:
                s.name = s.code.toString();
                break;
        }

        return s;
    }

    public nextHandlingEventType(): HandlingEventTypeEnum {
        if (this.hasBeenFulfilled()) {
            throw new Error('Job has already been fulfilled.');
        }

        if (this.status === ServiceStatusEnum.CANCELLED_BY_SERVICE_PROVIDER) {
            throw new Error('Job has already been cancelled');
        }

        if (this.hasBeenAssignedButNotAllocated()) {
            throw new Error('Job must be allocated to worker first');
        }

        switch (this.status) {
            case ServiceStatusEnum.ALLOCATED:
                return HandlingEventTypeEnum.START;
            case ServiceStatusEnum.STARTED:
                return HandlingEventTypeEnum.IN_PROGRESS;
            case ServiceStatusEnum.IN_PROGRESS:
                return HandlingEventTypeEnum.FULLFIL;
            default:
                return HandlingEventTypeEnum.FULLFIL;
        }
    }

    public hasBeenAssignedOrAllocated(): boolean {
        return this.allocationStatus !== ServiceAllocationStatusEnum.UNASSIGNED;
    }

    public hasBeenAllocated(): boolean {
        return this.hasBeenAssignedOrAllocated() && !this.hasBeenAssignedButNotAllocated();
    }

    public hasBeenAssignedButNotAllocated(): boolean {
        return this.allocationStatus === ServiceAllocationStatusEnum.ASSIGNED;
    }

    public hasBeenStarted(): boolean {
        return this.lastEvent !== null;
    }

    public isAssignedOrAllocatedTo(providerId: string): boolean {
        return this.provider?.dispatcher?.id === providerId || this.provider?.worker?.id === providerId;
    }

    public isAllocatedTo(workerId: string): boolean {
        return this.provider?.worker?.id === workerId;
    }

    public hasBeenFulfilled(): boolean {
        return this.status === ServiceStatusEnum.FULFILLED;
    }

    public isWorkInProgress(): boolean {
        return this.status === ServiceStatusEnum.STARTED || this.status === ServiceStatusEnum.IN_PROGRESS;
    }

    public hasBeenCancelled(): boolean {
        return [
            ServiceStatusEnum.CANCELLED_BY_OPERATOR,
            ServiceStatusEnum.FAILED,
            ServiceStatusEnum.CANCELLED_BY_SERVICE_PROVIDER,
            ServiceStatusEnum.CANCELLED_BY_CUSTOMER,
        ].includes(this.status);
    }

    public hasBeenMarkedAsFailed(): boolean {
        return this.status === ServiceStatusEnum.FAILED;
    }

    public hasBeenClosed(): boolean {
        return [ServiceStatusEnum.FAILED_PAYMENT, ServiceStatusEnum.FAILED, ServiceStatusEnum.CANCELLED_BY_CUSTOMER].includes(this.status);
    }

    public hasCustomerPaid(): boolean {
        return this.paymentStatus === PaymentGatewayResponseStatus.SUCCEEDED;
    }

    public isOngoing(): boolean {
        return (
            this.hasBeenAssignedOrAllocated() &&
            this.status !== ServiceStatusEnum.FULFILLED &&
            this.status !== ServiceStatusEnum.FAILED &&
            this.status !== ServiceStatusEnum.CANCELLED_BY_SERVICE_PROVIDER &&
            this.status !== ServiceStatusEnum.CANCELLED_BY_CUSTOMER &&
            this.status !== ServiceStatusEnum.CANCELLED_BY_OPERATOR
        );
    }

    public isHistorical(): boolean {
        return this.hasBeenAssignedOrAllocated() && !this.isOngoing();
    }
}
