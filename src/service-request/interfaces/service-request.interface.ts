import { Location } from '@shared/entities/location.entity';
import { Period } from '@shared/entities/period.entity';
import { Tenant } from '@shared/enums';
import { Priority } from '@shared/enums/priority';
import { ServiceRequestOptions } from '@shared/interfaces';
import { CustomerContactDto } from '@service-request/dto/customer-contact.dto';
import { MoneyDto } from '@service-request/dto/money.dto';
import { ServiceRequestDto } from '@service-request/dto/service-request.dto';
import { AppointmentFactory } from '@service-request/entities/factories/appointment.factory';
import { Provider } from '@service-request/entities/provider.entity';
import { LatLngDto } from '@service-provider/dto/lat-lng.dto';
import { PaymentGatewayResponseHistory } from '@payment/entities/payment-gateway-response-history.entity';
import { PaymentPurposeCode } from '../../shared/enums/payment-purpose-code';
import { CustomerOrderDto } from '../dto/customer-order.dto';
import { CustomerContact } from '../entities/customer-contact.entity';
import { CustomerRescheduleOrder } from '../entities/customer-reschedule-order.entity';
import { Rating } from '../entities/rating';
import { RequestedServicePackage } from '../entities/requested-service-package.entity';
import { HandlingHistory } from 'handling/entities/handling-history.entity';
import { HandlingEventTypeEnum } from 'handling/enums/handling-event-type.enum';
import { IServiceProvider } from 'service-provider/interfaces/service-provider.interface';

export interface IServiceRequest {
    getId(): string;
    getServiceProvider(): Provider; // refactor(roy): return IProvider
    serviceSchedule(): Period;
    priority(): Priority;
    distanceTo(latitude: number, longitude: number, unit?: string): number;
    isExpectedArrivalTimeLessThanDuration(hours: number, fromNow?: Date): boolean;
    hasAppointmentStartTimeChanged(dateTime: Date): boolean;
    hasSurpassedHourLimitBeforeJobIsAllowedToStart(): boolean;
    hasSurpassedHourLimitBeforeActivatingEmergencyCandidateScanningZone(): boolean;
    hasBeenRescheduledOnce(): boolean;
    getConfig(): ServiceRequestOptions;
    assignToDispatcher(dispatcher: IServiceProvider): void;
    allocateToWorker(worker: IServiceProvider, provider: IServiceProvider): void;
    adminChangeSpecification(
        appointmentPeriod: Period,
        customerContact: CustomerContact,
        customerAddress: Location,
        appointmentFactory: AppointmentFactory,
    ): void;
    changeConfiguration(config: ServiceRequestOptions): void;
    changeCustomerRating(rating: Rating): void;
    changeCRMCustomerId(crmCustomerId: string): void;
    changeServiceReportUrl(url: string): void;
    deriveCustomerPaymentProgress(paymentGatewayResponseHistory: PaymentGatewayResponseHistory): void;
    deriveServiceProgress(handlingHistory: HandlingHistory): void;
    hasBeenAssignedOrAllocated(): boolean;
    hasBeenAllocated(): boolean;
    hasBeenFulfilled(): boolean;
    hasBeenCancelled(): boolean;
    hasBeenMarkAsFailed(): boolean;
    hasCustomerPaid(paymentPurposeCode: PaymentPurposeCode): boolean;
    requiresCustomerPayment(paymentPurposeCode: PaymentPurposeCode): boolean;
    isAssignedOrAllocatedTo(providerId: string): boolean;
    isAllocatedTo(workerId: string): boolean;
    nextHandlingEventType(): HandlingEventTypeEnum;
    isOngoing(): boolean;
    isHistorical(): boolean;
    toDto(): ServiceRequestDto;
    cancel(provider: IServiceProvider): void;
    cancelByCustomer(): void;
    revoke(markAsFailed: boolean): void;
    beforeSave(): void;
    isWorkerScheduleOverlapped(start: Date, end: Date): boolean;
    secondsTillServiceScheduledDate(now?: Date): number;
    reviseRequestedServicePackages(servicePackages: RequestedServicePackage[]): void;
    haveCompletedAllTechnicalReports(): boolean;
    getCustomerAddressLatLng(): LatLngDto;
    getServiceProviderEarning(): number;
    getCustomerInvoiceTotalPrice(): MoneyDto;
    getCustomerContact(): CustomerContactDto;
    getPrincipalGroup(): Tenant;
    getCustomerOrder(): CustomerOrderDto;
    getEntitlement(): number;
    getExternalCustomerId(): string;
    getCRMCustomerId(): string;
    getCustomerRescheduleOrder(): CustomerRescheduleOrder;
    getVerificationCode(): string;
    allowReschedule(): boolean;
    restart(): void;
    resetCustomerOrder(): void;
    isServiceProviderIndependent(): boolean;
    createCustomerRescheduleOrder(appointmentFactory: AppointmentFactory, expectedArrivalPeriod: Period, now?: Date): void;
    executeCustomerRescheduleOrder(appointmentFactory: AppointmentFactory, paymentGatewayResponseHistory?: PaymentGatewayResponseHistory): void;
}
