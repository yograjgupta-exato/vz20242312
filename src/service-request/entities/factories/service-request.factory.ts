import { Injectable, Inject } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { AppConfigService } from '@shared/config';
import { Location } from '@shared/entities/location.entity';
import { PaymentGatewayResponseHistory } from '@payment/entities/payment-gateway-response-history.entity';
import { HandlingHistory } from '../../../handling/entities/handling-history.entity';
import { CustomerRescheduleOrder } from '../customer-reschedule-order.entity';
import { ServiceRequest } from '../service-request.entity';
import { Service } from '../service.entity';
import { AppointmentFactory } from './appointment.factory';
import { CustomerOrderFactory } from './customer-order.factory';
import { ProviderFactory } from './provider.factory';
import { ServiceRequestInput } from 'service-request/dto/service-request.input';
@Injectable()
export class ServiceRequestFactory {
    constructor(
        private readonly configService: AppConfigService,
        @Inject(AppointmentFactory) private readonly appointmentFactory: AppointmentFactory,
        @Inject(CustomerOrderFactory) private readonly customerOrderFactory: CustomerOrderFactory,
    ) {}

    public async create(input: Partial<ServiceRequestInput>, forCommit = true): Promise<ServiceRequest> {
        const { expectedArrivalPeriod, customerContact, customerAddress, customerOrder, externalCustomerId } = input;

        const sr = new ServiceRequest();

        sr.principalGroup = input.requestCategory;
        sr.customerAddress = plainToClass(Location, customerAddress);
        sr.customerContact = customerContact;
        sr.customerOrder = await this.customerOrderFactory.create(customerOrder, customerAddress, forCommit);
        sr.customerRescheduleOrder = CustomerRescheduleOrder.EMPTY;

        if (externalCustomerId) {
            sr.externalCustomerId = externalCustomerId;
        }

        sr.appointment = this.appointmentFactory.create(expectedArrivalPeriod, sr.customerOrder.totalServiceMinutes(), new Date());
        sr.service = Service.derivedFrom(
            HandlingHistory.EMPTY,
            ProviderFactory.createEmptyProvider(),
            PaymentGatewayResponseHistory.EMPTY,
            this.configService.serviceRequestOptions.paymentGatewayEnabled,
        );

        sr.securityCode = String(this.genSecurityCode(10000, 99999));
        sr.verificationCode = String(this.genVerificationCode(10000, 99999));
        // TODO: to remove AMSS_SERVICE_REPORT_URL & DMSS_SERVICE_REPORT_URL from env and configService
        // sr.serviceReportUrl = this.configService.tenantOptions(sr.principalGroup).serviceReportUrl;
        sr.changeConfiguration(this.configService.serviceRequestOptions);

        return sr;
    }

    private genSecurityCode(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min) + min);
    }

    private genVerificationCode(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min) + min);
    }
}
