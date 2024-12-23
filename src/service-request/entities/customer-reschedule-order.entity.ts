import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Column, JoinColumn, ManyToOne, RelationId } from 'typeorm';
import { PaymentGatewayResponseHistory } from '../../payment/entities/payment-gateway-response-history.entity';
import { PaymentGatewayResponse } from '../../payment/entities/payment-gateway-response.entity';
import { OptPeriod } from '../../shared/entities/opt-period.entity';
import { CurrencyCode } from '../../shared/enums';
import { PaymentGatewayResponseStatus } from '../../shared/enums/payment-gateway-response-status';
import { ColumnNumericTransformer } from '../../shared/typeorm/column-numeric-transformer';
import { CustomerRescheduleOrderDto } from '../dto/customer-reschedule-order.dto';
import { ServiceRequest } from './service-request.entity';

export class CustomerRescheduleOrder {
    public static readonly EMPTY = new CustomerRescheduleOrder(null, null, 0, 0, null, null);

    @ApiProperty({
        description: 'A time period of expected arrival (previous version). ',
    })
    @Column(() => OptPeriod)
    oldExpectedArrivalPeriod: OptPeriod;

    @ApiProperty({
        description: 'A time period of expected arrival (new version).',
    })
    @Column(() => OptPeriod)
    newExpectedArrivalPeriod: OptPeriod;

    @Column({
        default: CurrencyCode.Myr,
        enum: CurrencyCode,
        name: '_currency',
        type: 'enum',
    })
    currency: CurrencyCode;

    @Column('decimal', {
        default: 0,
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
        name: '_consumer_surcharge_amount',
    })
    consumerSurchargeAmount: number;

    @ApiHideProperty()
    @Column('decimal', {
        default: 0,
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
        name: '_impacted_service_provider_compensation_amount',
    })
    impactedServiceProviderCompensationAmount: number;

    @Column({
        type: 'uuid',
        nullable: true,
        name: '_impacted_service_provider_id',
    })
    impactedServiceProviderId?: string;

    @ManyToOne(() => PaymentGatewayResponse, {
        eager: true,
        nullable: true,
    })
    @JoinColumn()
    customerRescheduleOrderPaymentGatewayResponse?: PaymentGatewayResponse;

    @RelationId((item: ServiceRequest) => item.customerRescheduleOrder.customerRescheduleOrderPaymentGatewayResponse)
    @Column({
        name: '_customer_reschedule_order_payment_gateway_response_id',
        nullable: true,
    })
    customerRescheduleOrderPaymentGatewayResponseId?: string;

    @Column({
        default: PaymentGatewayResponseStatus.AWAITING_PAYMENT,
        enum: PaymentGatewayResponseStatus,
        type: 'enum',
        nullable: true,
        name: '_payment_status',
    })
    paymentStatus?: PaymentGatewayResponseStatus;

    @Column({
        default: false,
        name: '_surcharge_required',
    })
    surchargeRequired: boolean;

    @Column({
        type: 'timestamptz',
        nullable: true,
        name: '_executed_at',
    })
    executedAt?: Date;

    @Column({
        type: 'timestamptz',
        nullable: true,
        name: '_created_at',
    })
    createdAt?: Date;

    public constructor(
        oldExpectedArrivalPeriod: OptPeriod,
        newExpectedArrivalPeriod: OptPeriod,
        consumerSurchargeAmount: number,
        impactedServiceProviderCompensationAmount: number,
        impactedServiceProviderId: string,
        createdAt: Date,
    ) {
        this.newExpectedArrivalPeriod = oldExpectedArrivalPeriod;
        this.oldExpectedArrivalPeriod = newExpectedArrivalPeriod;

        this.consumerSurchargeAmount = consumerSurchargeAmount;

        this.surchargeRequired = this.consumerSurchargeAmount > 0;

        this.customerRescheduleOrderPaymentGatewayResponse = null;
        this.paymentStatus = this.surchargeRequired ? PaymentGatewayResponseStatus.AWAITING_PAYMENT : null;

        this.impactedServiceProviderCompensationAmount = impactedServiceProviderCompensationAmount;
        this.impactedServiceProviderId = impactedServiceProviderId;
        this.executedAt = null;
        this.createdAt = createdAt;

        this.currency = CurrencyCode.Myr;
    }

    static createWithSurcharge(
        oldExpectedArrivalPeriod: OptPeriod,
        newExpectedArrivalPeriod: OptPeriod,
        surchargeAmount: number,
        compensationAmount: number,
        impactedServiceProviderId: string,
        createdAt = new Date(),
    ): CustomerRescheduleOrder {
        return new CustomerRescheduleOrder(
            oldExpectedArrivalPeriod,
            newExpectedArrivalPeriod,
            surchargeAmount,
            compensationAmount,
            impactedServiceProviderId,
            createdAt,
        );
    }

    static createWithFreeOfCharge(
        oldExpectedArrivalPeriod: OptPeriod,
        newExpectedArrivalPeriod: OptPeriod,
        impactedServiceProviderId: string,
        createdAt = new Date(),
    ): CustomerRescheduleOrder {
        return new CustomerRescheduleOrder(oldExpectedArrivalPeriod, newExpectedArrivalPeriod, 0, 0, impactedServiceProviderId, createdAt);
    }

    public execute(paymentGatewayResponseHistory?: PaymentGatewayResponseHistory): void {
        if (!this.surchargeRequired) {
            this.executedAt = new Date();
            return;
        }

        const paymentGatewayResponse: PaymentGatewayResponse = paymentGatewayResponseHistory
            ? paymentGatewayResponseHistory.mostRecentResponse()
            : null;

        if (!paymentGatewayResponse || !paymentGatewayResponse?.responseStatus) {
            throw new Error('Fail to execute, please ensure payment is made');
        }

        this.customerRescheduleOrderPaymentGatewayResponse = paymentGatewayResponse;
        this.paymentStatus = paymentGatewayResponse.responseStatus;
        if (this.paymentStatus === PaymentGatewayResponseStatus.SUCCEEDED) {
            this.executedAt = new Date();
        }
    }

    public hasExecuted(): boolean {
        return !!this.executedAt;
    }

    public hasCustomerPaid(): boolean {
        return this.surchargeRequired && this.paymentStatus === PaymentGatewayResponseStatus.SUCCEEDED;
    }

    public isEmpty(): boolean {
        return this.oldExpectedArrivalPeriod === null || this.newExpectedArrivalPeriod === null || this.createdAt === null;
    }

    public toDto(): CustomerRescheduleOrderDto {
        const dto = new CustomerRescheduleOrderDto();
        dto.consumerSurchargeAmount = this.consumerSurchargeAmount;
        dto.executedAt = this.executedAt;
        dto.createdAt = this.createdAt;
        dto.newExpectedArrivalPeriod = this.newExpectedArrivalPeriod;
        dto.oldExpectedArrivalPeriod = this.oldExpectedArrivalPeriod;
        dto.paymentStatus = this.paymentStatus;
        dto.surchargeRequired = this.surchargeRequired;
        dto.impactedServiceProviderCompensationAmount = this.impactedServiceProviderCompensationAmount;
        dto.impactedServiceProviderId = this.impactedServiceProviderId;
        dto.currency = this.currency;

        //note(roy): not sure why `customerRescheduleOrderPaymentGatewayResponseId` always null
        dto.customerRescheduleOrderPaymentGatewayResponseId = this.customerRescheduleOrderPaymentGatewayResponseId;

        return dto;
    }
}
