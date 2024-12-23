import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Exclude, plainToClass } from 'class-transformer';
import * as geolib from 'geolib';
import * as moment from 'moment';
import { customAlphabet } from 'nanoid';
import {
    Entity,
    Column,
    DeepPartial,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    PrimaryColumn,
    Index,
    BeforeInsert,
    OneToMany,
    OneToOne,
} from 'typeorm';
import { Location } from '@shared/entities/location.entity';
import { Period } from '@shared/entities/period.entity';
import { Tenant } from '@shared/enums';
import { PaymentGatewayResponseStatus } from '@shared/enums/payment-gateway-response-status';
import { Priority } from '@shared/enums/priority';
import {
    UnableToCancelCompletedJobError,
    UnableToCancelNotPaidServiceRequestError,
    UnableToCancelRescheduledServiceRequestError,
    UnableToCancelServiceRequestDueToWindowPeriodIsPastError,
    UnableToCancelTerminatedJobError,
    UnableToOpenUnpaidServiceRequestError,
    UnableToRescheduleServiceRequestDueToUnpaidSurchargeError,
    UnableToRescheduleServiceRequestError,
} from '@shared/errors';
import { ServiceRequestOptions } from '@shared/interfaces';
import { AppointmentDto } from '@service-request/dto/appointment.dto';
import { CustomerContactDto } from '@service-request/dto/customer-contact.dto';
import { LocationDto } from '@service-request/dto/location.dto';
import { MoneyDto } from '@service-request/dto/money.dto';
import { ServiceRequestDto } from '@service-request/dto/service-request.dto';
import { ServiceDto } from '@service-request/dto/service.dto';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { LatLngDto } from '@service-provider/dto/lat-lng.dto';
import { PaymentGatewayResponseHistory } from '@payment/entities/payment-gateway-response-history.entity';
import { WalletTransaction } from '@wallet/entities/wallet-transaction.entity';
import { HandlingHistory } from '../../handling/entities/handling-history.entity';
import { Refund } from '../../refund/refund.entity';
import { OptPeriod } from '../../shared/entities/opt-period.entity';
import { PaymentPurposeCode } from '../../shared/enums/payment-purpose-code';
import { CustomerOrderDto } from '../dto/customer-order.dto';
import { Appointment } from './appointment.entity';
import { CustomerContact } from './customer-contact.entity';
import { CustomerOrder } from './customer-order.entity';
import { CustomerRescheduleOrder } from './customer-reschedule-order.entity';
import { AppointmentFactory } from './factories/appointment.factory';
import { Provider } from './provider.entity';
import { Rating } from './rating';
import { RequestedServicePackage } from './requested-service-package.entity';
import { Service } from './service.entity';
import { HandlingEventTypeEnum } from 'handling/enums/handling-event-type.enum';
import { IServiceProvider } from 'service-provider/interfaces/service-provider.interface';

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 7);

@Entity({ name: 'service_requests' })
export class ServiceRequest implements IServiceRequest {
    constructor(input?: DeepPartial<ServiceRequest>) {
        if (input) {
            for (const [key, value] of Object.entries(input)) {
                (this as any)[key] = value;
            }
        }
    }

    @ApiProperty()
    @PrimaryColumn('varchar', {
        length: 21,
    })
    id: string;

    @ApiProperty({
        description: 'A time period during which an appointment is applicable.',
    })
    @Column(() => Appointment)
    appointment: Appointment;

    @ApiProperty({
        description: 'The address associated with service ticket',
    })
    @Column(() => Location)
    customerAddress: Location;

    @ApiProperty({
        description: 'Contact information about the customer.',
    })
    @Column(() => CustomerContact)
    customerContact: CustomerContact;

    @ApiProperty({
        description: 'Order information from customer.',
    })
    @Column(() => CustomerOrder)
    customerOrder: CustomerOrder;

    @ApiProperty({
        description: 'Order filed for customer rescheduling.',
    })
    @Column({ type: 'jsonb', nullable: true })
    customerRescheduleOrder: CustomerRescheduleOrder;

    @Column({
        nullable: true,
    })
    securityCode?: string;

    @ApiProperty({
        description: 'Verification code is used to verify when job is completed.',
    })
    @Column({
        nullable: true,
    })
    verificationCode?: string;

    @ApiProperty({
        description: 'The Servicing Report Url.',
    })
    @Column({
        name: 'service_report_url',
        nullable: true,
    })
    serviceReportUrl?: string;

    @ApiProperty({
        description: `A service is the actual execution of a ServiceRequest.
        The work is to be fulfilled by the allocated Provider.`,
    })
    @Column(() => Service)
    service: Service;

    @Column({
        name: 'principal_group',
        type: 'enum',
        enum: Tenant,
        default: Tenant.Daikin,
    })
    principalGroup: Tenant;

    @Index()
    @Column({
        nullable: true,
    })
    externalCustomerId?: string;

    @Index()
    @Column({
        comment: 'A link back to CRM customer base, so that we can attach competitor-eq under same customer reference in CRM',
        nullable: true,
    })
    crmCustomerId?: string;

    @Column({
        type: 'timestamptz',
        name: 'payment_received_at',
        nullable: true,
    })
    paymentReceivedAt?: Date;

    @Column({
        nullable: true,
    })
    paymentMethod?: string;

    @Column({
        type: 'timestamptz',
        name: 'transitioned_at',
        nullable: true,
    })
    transitionedAt?: Date;

    @Index()
    @CreateDateColumn({
        type: 'timestamptz',
        name: 'created_at',
    })
    createdAt: Date;

    @UpdateDateColumn({
        type: 'timestamptz',
        name: 'updated_at',
    })
    updatedAt: Date;

    @Column({ nullable: true, type: 'uuid', name: 'last_customer_payment_gateway_response_id' })
    @Exclude()
    lastCustomerPaymentGatewayResponseId?: string;

    @ApiProperty({
        description: 'The configuration of an service request',
    })
    @Column('simple-json')
    config: ServiceRequestOptions;

    @Column('simple-json', { nullable: true })
    rating: Rating;

    @DeleteDateColumn({
        type: 'timestamptz',
        name: 'deleted_at',
    })
    @Exclude()
    @ApiHideProperty()
    deletedAt: Date;

    @OneToMany(
        () => WalletTransaction,
        trx => trx.serviceRequest,
    )
    walletTransactions: WalletTransaction[];

    @OneToOne(
        () => Refund,
        r => r.serviceRequest,
    )
    refund?: Refund;

    @BeforeInsert()
    beforeInsert() {
        this.id = `${moment()
            .utcOffset(this.getConfig()?.timezoneOffset)
            .format('YYMMDD')}-${nanoid()}`;
    }

    // refactor(roy): decorate with @BeforeInsert or @BeforeSave
    beforeSave() {
        if (this.customerOrder) {
            // note(roy): this is a hack to overcome https://github.com/typeorm/typeorm/issues/3095
            delete this.customerOrder.servicePackages;
        }
    }

    public priority(): Priority {
        if (
            !this.hasBeenCancelled() &&
            this.isExpectedArrivalTimeLessThanDuration(this.getConfig()?.hourLimitBeforeUrgent) &&
            !this.hasBeenAssignedOrAllocated()
        ) {
            return Priority.HIGH;
        }

        return Priority.MEDIUM;
    }

    public hasSurpassedHourLimitBeforeJobIsAllowedToStart(): boolean {
        return this.isExpectedArrivalTimeLessThanDuration(this.getConfig()?.hourLimitBeforeJobIsAllowedToStart);
    }

    public hasSurpassedHourLimitBeforeActivatingEmergencyCandidateScanningZone(): boolean {
        return this.isExpectedArrivalTimeLessThanDuration(this.getConfig()?.hourLimitBeforeUrgent);
    }

    public hasBeenRescheduledOnce(): boolean {
        return !!this.customerRescheduleOrder?.executedAt;
    }

    public getConfig(): ServiceRequestOptions {
        return this.config;
    }

    public getId(): string {
        return this.id;
    }

    // refactor(roy): return IProvider
    public getServiceProvider(): Provider {
        return this.service.provider;
    }

    public isWorkerScheduleOverlapped(start: Date, end: Date): boolean {
        return this.appointment.isWorkerScheduleOverlapped(start, end);
    }

    public isExpectedArrivalTimeLessThanDuration(hours: number, fromNow?: Date): boolean {
        return this.appointment.isExpectedArrivalTimeLessThanDurationFromNow(hours, fromNow);
    }

    public hasAppointmentStartTimeChanged(dateTime: Date): boolean {
        return !this.appointment.isExpectedArrivalTimeEqualTo(dateTime);
    }

    public serviceSchedule(): Period {
        return this.appointment?.serviceSchedule;
    }

    public secondsTillServiceScheduledDate(now?: Date): number {
        return this.appointment.secondsTillExpectedArrivalDate(now);
    }

    public distanceTo(latitude: number, longitude: number, unit = 'km'): number {
        if (!this.customerAddress.latitude || !this.customerAddress.longitude || !latitude || !longitude) {
            return -1;
        }

        const from = { latitude: this.customerAddress.latitude, longitude: this.customerAddress.longitude };
        const to = { latitude, longitude };

        return geolib.convertDistance(geolib.getDistance(from, to), unit);
    }

    public allocateToWorker(worker: IServiceProvider, dealer: IServiceProvider): void {
        // refactor(roy): assign appointment period here.
        if (!this.isAssignedOrAllocatedTo(dealer.getId())) {
            throw new Error('Job is not assigned/allocated to you');
        }

        this.service = this.service.allocateToWorker(worker, this.serviceSchedule());
    }

    public assignToDispatcher(dispatcher: IServiceProvider): void {
        // note(roy): business logic: if dispatcher is independent, required to have schedule.
        if (this.hasBeenAssignedOrAllocated() && !this.hasBeenCancelled()) {
            throw new Error('Job is taken');
        }

        if (this.getConfig()?.paymentGatewayEnabled && !this.hasCustomerPaid(PaymentPurposeCode.FEE)) {
            throw new UnableToOpenUnpaidServiceRequestError();
        }

        if (dispatcher.isWorker()) {
            throw Error('Dispatcher with type "Worker" found. It has to be of type: "Dealer" or "Independent"');
        }
        this.service = this.service.assignToDispatcher(dispatcher);

        if (dispatcher.isIndependent()) {
            this.service = this.service.allocateToWorker(dispatcher, this.serviceSchedule());
        }
    }

    public isServiceProviderIndependent(): boolean {
        return this.hasBeenAssignedOrAllocated() && this.getServiceProvider().dispatcher.id === this.getServiceProvider().worker.id;
    }

    public createCustomerRescheduleOrder(appointmentFactory: AppointmentFactory, expectedArrivalPeriod: Period, now = new Date()): void {
        if (!this.allowReschedule(now)) {
            throw new UnableToRescheduleServiceRequestError();
        }
        const hasAppointmentStartTimeChanged = this.hasAppointmentStartTimeChanged(expectedArrivalPeriod.start);
        if (!hasAppointmentStartTimeChanged) {
            throw new Error('Unnecessary rescheduling: New appointment start time is the same as current one');
        }

        //note(roy): create appointment trial, it throws error if doesn't fit the business rule.
        appointmentFactory.create(expectedArrivalPeriod, this.appointment.totalServiceMinutes, now);

        const surchargeAmount = +this.getConfig()?.ecRescheduleSurchargeAmount;
        const compensationAmount = +this.getConfig()?.ecRescheduleCompensationAmount;
        if (this.getConfig()?.paymentGatewayEnabled && !this.allowRescheduleWithoutSurcharge(now) && surchargeAmount > 0) {
            this.customerRescheduleOrder = CustomerRescheduleOrder.createWithSurcharge(
                expectedArrivalPeriod.toOptPeriod(),
                this.appointment.expectedArrivalPeriod.toOptPeriod(),
                surchargeAmount,
                compensationAmount,
                this.getServiceProvider().dispatcher?.id,
                now,
            );

            throw new UnableToRescheduleServiceRequestDueToUnpaidSurchargeError();
        }

        this.customerRescheduleOrder = CustomerRescheduleOrder.createWithFreeOfCharge(
            expectedArrivalPeriod.toOptPeriod(),
            this.appointment.expectedArrivalPeriod.toOptPeriod(),
            this.getServiceProvider().dispatcher?.id,
            now,
        );
    }

    public executeCustomerRescheduleOrder(
        appointmentFactory: AppointmentFactory,
        paymentGatewayResponseHistory?: PaymentGatewayResponseHistory,
    ): void {
        if (this.getCustomerRescheduleOrder().isEmpty()) {
            throw new Error('Please create a new customer reschedule order before execution');
        }

        if (
            this.getCustomerRescheduleOrder().surchargeRequired &&
            !this.getCustomerRescheduleOrder().hasCustomerPaid() &&
            paymentGatewayResponseHistory === null
        ) {
            throw new UnableToRescheduleServiceRequestDueToUnpaidSurchargeError();
        }

        this.getCustomerRescheduleOrder().execute(paymentGatewayResponseHistory);
        const newExpectedArrivalPeriod: OptPeriod = this.getCustomerRescheduleOrder().newExpectedArrivalPeriod;
        this.reschedule(
            new Period(newExpectedArrivalPeriod.start, newExpectedArrivalPeriod.end, newExpectedArrivalPeriod.timezoneOffset),
            appointmentFactory,
            this.getCustomerRescheduleOrder().createdAt,
        );
    }

    // note(roy): only for admin bypass
    // todo(roy): expose to admin panel as endpoint
    public adminChangeSpecification(
        expectedArrivalPeriod: Period,
        customerContact: CustomerContact,
        customerAddress: Location,
        appointmentFactory: AppointmentFactory,
    ): void {
        this.customerContact = customerContact ?? this.customerContact;
        this.customerAddress = customerAddress ?? this.customerAddress;

        const newExpectedArrivalPeriod = expectedArrivalPeriod ?? this.appointment.expectedArrivalPeriod;
        const hasAppointmentStartTimeChanged = this.hasAppointmentStartTimeChanged(newExpectedArrivalPeriod.start);
        if (hasAppointmentStartTimeChanged) {
            this.reschedule(newExpectedArrivalPeriod, appointmentFactory, new Date());
        }
    }

    /**
     * To clean up existing provider and make new appointment
     * @param newExpectedArrivalPeriod
     * @param appointmentFactory
     */
    private reschedule(newExpectedArrivalPeriod: Period, appointmentFactory: AppointmentFactory, now: Date) {
        this.appointment = appointmentFactory.create(newExpectedArrivalPeriod, this.appointment.totalServiceMinutes, now);
        this.service = this.service.reschedule();
    }

    public changeConfiguration(config: DeepPartial<ServiceRequestOptions>) {
        this.config = {
            ...this.config,
            ...config,
        };
    }

    public reviseRequestedServicePackages(servicePackages: RequestedServicePackage[]): void {
        this.customerOrder = this.customerOrder.reviseRequestedServicePackages(servicePackages);
    }

    public deriveServiceProgress(handlingHistory: HandlingHistory): void {
        const lastStatus = this.service.status;
        this.service = this.service.derivedFromHandlingHistory(handlingHistory);
        if (lastStatus !== this.service.status) {
            this.transitionedAt = new Date();
        }
    }

    public deriveCustomerPaymentProgress(paymentGatewayResponseHistory: PaymentGatewayResponseHistory): void {
        this.service = this.service.derivedFromPaymentGatewayResponseHistory(paymentGatewayResponseHistory);
        const lastPaymentResponse = this.service.lastCustomerPaymentGatewayResponse;
        if (lastPaymentResponse) {
            this.paymentReceivedAt =
                lastPaymentResponse.responseStatus === PaymentGatewayResponseStatus.SUCCEEDED ? new Date() : this.paymentReceivedAt;
            this.paymentMethod = lastPaymentResponse.getPaymentMethod();
        }

        this.transitionedAt = new Date();
    }

    // todo(roy):just do it under service-request level first.
    public deriveCustomerRescheduleSurchargePaymentProgress(paymentGatewayResponseHistory: PaymentGatewayResponseHistory): void {
        this.service = this.service.derivedFromPaymentGatewayResponseHistory(paymentGatewayResponseHistory);
        const lastPaymentResponse = this.service.lastCustomerPaymentGatewayResponse;
        if (lastPaymentResponse) {
            this.paymentReceivedAt =
                lastPaymentResponse.responseStatus === PaymentGatewayResponseStatus.SUCCEEDED ? new Date() : this.paymentReceivedAt;
            this.paymentMethod = lastPaymentResponse.getPaymentMethod();
        }
    }

    /**
     * Restart the service request ticket with payment history preserved.
     */
    public restart(): void {
        this.service = this.service.restart();
    }

    public resetCustomerOrder(): void {
        this.customerOrder = this.customerOrder.reset();
    }

    public changeCustomerRating(rating: Rating): void {
        this.rating = rating;
    }

    public hasBeenAssignedOrAllocated(): boolean {
        return this.service.hasBeenAssignedOrAllocated();
    }

    public hasBeenAllocated(): boolean {
        return this.service.hasBeenAllocated();
    }

    public isWorkInProgress(): boolean {
        return this.service.isWorkInProgress();
    }

    public hasBeenFulfilled(): boolean {
        return this.service.hasBeenFulfilled();
    }

    public hasBeenCancelled(): boolean {
        return this.service.hasBeenCancelled();
    }

    public hasBeenClosed(): boolean {
        return this.service.hasBeenClosed();
    }

    public hasBeenMarkAsFailed(): boolean {
        return this.service.hasBeenMarkedAsFailed();
    }

    public hasCustomerPaid(paymentPurposeCode: PaymentPurposeCode): boolean {
        switch (paymentPurposeCode) {
            case PaymentPurposeCode.FEE:
                return this.service.hasCustomerPaid();
            case PaymentPurposeCode.EC_RESCHEDULE_SURCHARGE:
                return this.getCustomerRescheduleOrder().hasCustomerPaid();
            default:
                throw new Error(`hasCustomerPaid: ${paymentPurposeCode} not implemented`);
        }
    }

    public requiresCustomerPayment(paymentPurposeCode: PaymentPurposeCode): boolean {
        switch (paymentPurposeCode) {
            case PaymentPurposeCode.EC_RESCHEDULE_SURCHARGE:
                return this.getCustomerRescheduleOrder().surchargeRequired;
            default:
                throw new Error(`hasCustomerPaid: ${paymentPurposeCode} not implemented`);
        }
    }

    public isAssignedOrAllocatedTo(providerId: string): boolean {
        return this.service.isAssignedOrAllocatedTo(providerId);
    }

    public isAllocatedTo(workerId: string): boolean {
        return this.service.isAllocatedTo(workerId);
    }

    public nextHandlingEventType(): HandlingEventTypeEnum {
        return this.service.nextHandlingEventType();
    }

    public isOngoing(): boolean {
        return this.service.isOngoing();
    }

    public isHistorical(): boolean {
        return this.service.isHistorical();
    }

    public cancel(serviceProvider: IServiceProvider): void {
        if (this.hasBeenFulfilled()) {
            throw new UnableToCancelCompletedJobError();
        }
        this.service = this.service.cancel(serviceProvider);
        this.transitionedAt = new Date();
    }

    public cancelByCustomer(): void {
        this.validateAllowEcCancelAndThrowError(true);
        this.service = this.service.cancelByCustomer();
        this.transitionedAt = new Date();
    }

    public revoke(markAsFailed: boolean): void {
        this.service = this.service.revoke(markAsFailed);
        if (markAsFailed) {
            this.service.eligibleForRefund = true;
        }
        this.transitionedAt = new Date();
    }

    public expiredBySystem(): void {
        this.service = this.service.expiredBySystem();
        this.transitionedAt = new Date();
    }

    public haveCompletedAllTechnicalReports(): boolean {
        return this.customerOrder.haveCompletedAllTechnicalReports;
    }

    public getCustomerAddressLatLng(): LatLngDto {
        const latLng = new LatLngDto();
        latLng.latitude = this.customerAddress.latitude;
        latLng.longitude = this.customerAddress.longitude;
        return latLng;
    }

    public getServiceProviderEarning(): number {
        return this.customerOrder.serviceProviderTotal;
    }

    public getCustomerInvoiceTotalPrice(): MoneyDto {
        return {
            amount: this.customerOrder.consumerTotal,
            currency: this.customerOrder.currency,
        };
    }

    public getCustomerContact(): CustomerContactDto {
        return this.customerContact;
    }

    public getPrincipalGroup(): Tenant {
        return this.principalGroup;
    }

    public getCustomerOrder(): CustomerOrderDto {
        return this.customerOrder?.toDto();
    }

    // note(roy): always access customerRescheduleOrder with this method.
    // It comes with auto initialization of customerRescheduleOrder obj.
    //
    // why? Because customerRescheduleOrder is a json field, it can be null - thus potentially raised null pointer error
    public getCustomerRescheduleOrder(): CustomerRescheduleOrder {
        this.customerRescheduleOrder = plainToClass(CustomerRescheduleOrder, this.customerRescheduleOrder || CustomerRescheduleOrder.EMPTY);
        return this.customerRescheduleOrder;
    }

    public getEntitlement(): number {
        return this.customerOrder.serviceTypesEntitlement;
    }

    public getExternalCustomerId(): string {
        return this.externalCustomerId;
    }

    public changeCRMCustomerId(crmCustomerId: string): void {
        this.crmCustomerId = crmCustomerId;
    }

    public changeServiceReportUrl(serviceReportUrl: string): void {
        this.serviceReportUrl = serviceReportUrl;
    }

    public getCRMCustomerId(): string {
        return this.crmCustomerId;
    }

    public getVerificationCode(): string {
        return this.verificationCode;
    }

    public allowReschedule(fromNow?: Date): boolean {
        if (!this.hasCustomerPaid(PaymentPurposeCode.FEE) || this.isWorkInProgress() || this.hasBeenClosed() || this.hasBeenFulfilled()) {
            return false;
        }
        return (
            (this.getConfig()?.ecRescheduleMultipleOccurrencesAllowed || !this.hasBeenRescheduledOnce()) &&
            this.appointment.isExpectedArrivalTimeMoreThanDurationFromNow(this.getConfig()?.hourLimitBeforeEcRescheduleOptionIsDisabled || 3, fromNow)
        );
    }

    // todo(roy): impl & throw error on actual cancellation if fail following checks.`
    public validateAllowEcCancelAndThrowError(throwError = true, fromNow = new Date()): boolean {
        try {
            if (!this.hasCustomerPaid(PaymentPurposeCode.FEE)) {
                throw new UnableToCancelNotPaidServiceRequestError();
            }

            if (this.hasBeenRescheduledOnce()) {
                throw new UnableToCancelRescheduledServiceRequestError();
            }

            if (this.hasBeenFulfilled()) {
                throw new UnableToCancelCompletedJobError();
            }

            if (this.hasBeenClosed()) {
                throw new UnableToCancelTerminatedJobError();
            }

            if (
                !this.appointment.isExpectedArrivalTimeMoreThanDurationFromNow(
                    this.getConfig()?.hourLimitBeforeEcCancellationOptionIsDisabled || 24,
                    fromNow,
                )
            ) {
                throw new UnableToCancelServiceRequestDueToWindowPeriodIsPastError();
            }
        } catch (err) {
            if (throwError) {
                throw err;
            }
            return false;
        }
        return true;
    }

    public allowRescheduleWithoutSurcharge(fromNow?: Date): boolean {
        return this.appointment.isExpectedArrivalTimeMoreThanDurationFromNow(
            this.getConfig()?.hourLimitBeforeEcRescheduleSurchageIsRequired || 12,
            fromNow,
        );
    }

    public toDto(): ServiceRequestDto {
        const dto = new ServiceRequestDto();
        dto.id = this.id;
        dto.createdAt = this.createdAt;
        dto.updatedAt = this.updatedAt;
        dto.principalGroup = this.principalGroup;
        dto.principalGroupName = this.principalGroup === Tenant.Daikin ? 'Daikin' : 'Acson';
        dto.expectedArrivalPeriod = this.appointment.expectedArrivalPeriod;
        dto.customerAddress = new LocationDto(this.customerAddress);
        dto.customerContact = this.customerContact;
        dto.customerOrder = this.customerOrder.toDto();
        dto.priority = this.priority();
        dto.appointment = new AppointmentDto(this.appointment);
        dto.securityCode = this.securityCode;
        dto.verificationCode = this.verificationCode;
        dto.crmCustomerId = this.crmCustomerId;
        dto.allowReschedule = this.allowReschedule();
        dto.allowCancel = this.validateAllowEcCancelAndThrowError(false);

        dto.service = new ServiceDto();
        dto.service.lastEvent = this.service.lastEvent;
        dto.service.lastCustomerPaymentGatewayResponse = this.service.lastCustomerPaymentGatewayResponse;
        dto.service.nextActionType = this.service.toNextServiceActionTypeDto();
        dto.service.provider = this.service.provider;
        dto.service.status = this.service.toServiceStatusDto();
        dto.service.remarks = this.service.remarks;
        dto.service.isRefunded = this.service.isRefunded;
        dto.service.eligibleForRefund = this.service.eligibleForRefund;

        dto.serviceReportUrl = this.serviceReportUrl;
        dto.externalCustomerId = this.externalCustomerId;
        dto.rating = this.rating;
        dto.paymentMethod = this.paymentMethod;
        dto.customerRescheduleOrder = this.getCustomerRescheduleOrder().toDto();

        if (dto.service.lastCustomerPaymentGatewayResponse) {
            dto.paymentMethod = dto.paymentMethod || dto.service.lastCustomerPaymentGatewayResponse.getPaymentMethod();
            dto.service.lastCustomerPaymentGatewayResponse.transactionId =
                dto.service.lastCustomerPaymentGatewayResponse.transactionId || dto.service.lastCustomerPaymentGatewayResponse.getTransactionId();
        }

        dto.refund = this.refund;

        return dto;
    }
}
