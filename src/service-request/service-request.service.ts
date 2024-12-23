import { InjectQueue } from '@nestjs/bull';
import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import { CommandBus, QueryBus, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { CrudRequest } from '@nestjsx/crud';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Queue } from 'bull';
import * as moment from 'moment';
import { IsNull, LessThan, Not, Repository } from 'typeorm';
import {
    ServiceRequestCreatedEvent,
    ServiceRequestConfirmedEvent,
    ServiceRequestCancelledEvent,
    ServiceRequestRescheduledEvent,
    ServiceRequestFailedEvent,
} from '@cqrs/events/service-request.event';
import { AppConfigService } from '@shared/config';
import { UserType } from '@shared/enums';
import { EntityNotFoundError, OutOfServiceCoverageError, UnableToRescheduleServiceRequestDueToUnpaidSurchargeError } from '@shared/errors';
import { LatLngDto } from '@service-provider/dto/lat-lng.dto';
import { ServicePackage } from '@service-package/entities/service-package.entity';
import { PaymentGatewayResponse } from '@payment/entities/payment-gateway-response.entity';
import { ExpireJobAssignmentCommand } from '../dispatching/commands/expire-job-assignment.command';
import { PaymentCheckoutInfoDto } from '../payment/dtos/payment-checkout-info.dto';
import { GetIPay88PaymentCheckoutInfoQuery } from '../payment/queries/get-ipay88-payment-checkout-info.query';
import { RefundInput } from '../refund/refund.dto';
import { RefundService } from '../refund/refund.service';
import { ServiceProviderService } from '../service-provider/service-provider.service';
import { Period } from '../shared/entities/period.entity';
import { PaymentPurposeCode } from '../shared/enums/payment-purpose-code';
import { CheckoutServiceRequestDto } from './dto/checkout-service-request.dto';
import { PeriodInput } from './dto/period.input';
import { ServiceRequestUpdateInput } from './dto/service-request-update.input';
import { ServiceRequestInput } from './dto/service-request.input';
import { TechnicalNoteDto } from './dto/technical-note.dto';
import { AppointmentFactory } from './entities/factories/appointment.factory';
import { ServiceRequestFactory } from './entities/factories/service-request.factory';
import { RequestedServicePackage } from './entities/requested-service-package.entity';
import { ServiceAllocationStatusEnum } from './entities/service-allocation-status.enum';
import { ServiceRequest } from './entities/service-request.entity';
import { ServiceStatusEnum } from './entities/service-status.enum';
import { IServiceRequest } from './interfaces/service-request.interface';
import { IsWithinCoverageQuery } from 'service-area/queries/is-within-coverage.query';

@Injectable()
export class ServiceRequestService extends TypeOrmCrudService<ServiceRequest> {
    constructor(
        private readonly appConfig: AppConfigService,
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
        private readonly configService: AppConfigService,
        @Inject(AppointmentFactory) private readonly appointmentFactory: AppointmentFactory,
        @InjectRepository(ServiceRequest) private readonly repository: Repository<ServiceRequest>,
        @InjectRepository(RequestedServicePackage) private readonly requestedServicePackageRepository: Repository<RequestedServicePackage>,
        @InjectRepository(ServicePackage) private readonly servicePackageRepository: Repository<ServicePackage>,
        @InjectRepository(PaymentGatewayResponse) private readonly paymentGatewayResponseRepository: Repository<PaymentGatewayResponse>,
        @Inject(ServiceRequestFactory) private readonly serviceRequestFactory: ServiceRequestFactory,
        @InjectQueue('reminder') private readonly reminderQueue: Queue,
        private readonly eventBus: EventBus,
        private readonly refundService: RefundService,
        private readonly serviceProviderService: ServiceProviderService,
    ) {
        super(repository);
    }

    private readonly logger = new Logger(ServiceRequestService.name);

    async create(input: ServiceRequestInput): Promise<ServiceRequest> {
        const sr = await this.calculate(input, true);
        const result = await this.repository.save(sr);

        this.eventBus.publish(new ServiceRequestCreatedEvent(result));

        if (!sr.getConfig().paymentGatewayEnabled) {
            this.eventBus.publish(new ServiceRequestConfirmedEvent(sr));
        }

        if (sr.getConfig().reminderEnabled) {
            await this.addToReminders(sr);
        }

        return result;
    }

    async calculate(input: ServiceRequestInput, forCommit = false): Promise<ServiceRequest> {
        const customerLatLng = new LatLngDto();
        customerLatLng.latitude = input.customerAddress.latitude;
        customerLatLng.longitude = input.customerAddress.longitude;
        const isWithinCoverage = await this.queryBus.execute(new IsWithinCoverageQuery(customerLatLng));
        if (!isWithinCoverage) {
            throw new OutOfServiceCoverageError();
        }
        return this.serviceRequestFactory.create(input, forCommit);
    }

    async get(id: string, join: any[] = []): Promise<ServiceRequest> {
        const sr = await this.readOne({
            parsed: {
                fields: [],
                paramsFilter: [{ field: 'id', operator: '$eq', value: id }],
                search: {
                    $and: [
                        {
                            id: {
                                $eq: id,
                            },
                        },
                    ],
                },
                authPersist: undefined,
                filter: [],
                or: [],
                join,
                sort: [],
                limit: undefined,
                offset: undefined,
                page: undefined,
                cache: undefined,
            },
            options: { query: { join: { refund: { eager: false } } }, routes: {}, params: {} },
        });

        if (sr.service.provider?.worker?.id) {
            const assignedServiceProvider = await this.serviceProviderService.findOne(sr.service.provider?.worker?.id);
            sr.service.provider.worker.rating = assignedServiceProvider.rating;
        }

        return sr;
    }

    async readOne(req: CrudRequest): Promise<ServiceRequest> {
        const result = await this.getOne(req);
        // refactor(roy): eager:true defined in entity will not work due to crudx/typeorm is using QueryBuilder internally.
        result.customerOrder.servicePackages = await this.requestedServicePackageRepository.find({ serviceRequestId: result.id });
        result.service.lastCustomerPaymentGatewayResponse = await this.paymentGatewayResponseRepository.findOne({
            id: result.lastCustomerPaymentGatewayResponseId,
        });
        return result;
    }

    async reschedule(id: string, expectedArrivalPeriod: PeriodInput): Promise<CheckoutServiceRequestDto> {
        const sr = await this.repository.findOne(id);
        if (!sr) {
            throw new EntityNotFoundError('ServiceRequest', id);
        }

        let paymentCheckoutInfoDto: PaymentCheckoutInfoDto = null;
        try {
            const hasAppointmentStartTimeChanged = sr.hasAppointmentStartTimeChanged(expectedArrivalPeriod.start);
            sr.createCustomerRescheduleOrder(this.appointmentFactory, new Period(expectedArrivalPeriod.start, expectedArrivalPeriod.end));
            sr.executeCustomerRescheduleOrder(this.appointmentFactory);

            if (hasAppointmentStartTimeChanged) {
                await this.addToReminders(sr);
            }
        } catch (err) {
            if (!(err instanceof UnableToRescheduleServiceRequestDueToUnpaidSurchargeError)) {
                throw err;
            }
            paymentCheckoutInfoDto = await this.queryBus.execute(
                new GetIPay88PaymentCheckoutInfoQuery(sr.getId(), PaymentPurposeCode.EC_RESCHEDULE_SURCHARGE),
            );
        }

        sr.beforeSave();
        await this.repository.save(sr);
        if (sr.hasBeenRescheduledOnce()) {
            const srWithServicePackages: IServiceRequest = await this.repo.findOne(sr.getId());
            this.eventBus.publish(
                new ServiceRequestRescheduledEvent(srWithServicePackages, sr.getCustomerRescheduleOrder()?.impactedServiceProviderId),
            );
        }
        return CheckoutServiceRequestDto.from(sr.toDto(), paymentCheckoutInfoDto);
    }

    async adminChangeSpecification(id: string, input: ServiceRequestUpdateInput): Promise<ServiceRequest> {
        const sr = await this.repository.findOne(id);
        if (sr === null) {
            throw new EntityNotFoundError('ServiceRequest', id);
        }

        const hasAppointmentStartTimeChanged = sr.hasAppointmentStartTimeChanged(input.expectedArrivalPeriod.start);
        const impactedServiceProvider = sr.getServiceProvider();

        sr.adminChangeSpecification(input.expectedArrivalPeriod, input.customerContact, input.customerAddress, this.appointmentFactory);
        sr.beforeSave();
        const result = this.repository.save(sr);

        if (hasAppointmentStartTimeChanged) {
            const srWithServicePackages: IServiceRequest = await this.repo.findOne(sr.getId());
            this.eventBus.publish(new ServiceRequestRescheduledEvent(srWithServicePackages, impactedServiceProvider?.dispatcher?.id));
            await this.addToReminders(srWithServicePackages);
        }

        return result;
    }

    async addToReminders(sr: IServiceRequest) {
        await this.reminderQueue.add(
            'remind',
            { serviceRequestDto: sr.toDto() },
            {
                delay: moment
                    .utc(sr.serviceSchedule().start)
                    .add(-sr.getConfig().remindProviderXSecondsBeforeJobStart, 'seconds')
                    .diff(moment().utc(), 'milliseconds'),
            },
        );

        await this.reminderQueue.add(
            'remind',
            { serviceRequestDto: sr.toDto() },
            {
                delay: moment
                    .utc(sr.serviceSchedule().start)
                    .add(-1, 'day')
                    .diff(moment().utc(), 'milliseconds'),
            },
        );
    }

    async patchPricingDiscrepancyForSelangorState(): Promise<number> {
        const srs = await this.repository.find({
            where: {
                customerAddress: {
                    state: 'Selangor',
                },
            },
        });

        let patchedCounter = 0;
        for (const sr of srs) {
            const rsps = await this.requestedServicePackageRepository.find({
                where: {
                    serviceRequestId: sr.getId(),
                },
            });

            let count = 0;
            for (const rsp of rsps) {
                const {
                    serviceProviderQuotationSubTotal,
                    serviceProviderQuotationTotal,
                    serviceProviderQuotationDiscountAmount,
                    serviceProviderQuotationDiscountedUnitPrice,
                    technicalReport,
                } = rsp;

                const svp = await this.servicePackageRepository.findOne({ id: rsp.servicePackageId });
                rsp.reviseFromNewQuotations(svp, rsp.quantity);
                const {
                    serviceProviderQuotationSubTotal: a,
                    serviceProviderQuotationTotal: b,
                    serviceProviderQuotationDiscountAmount: c,
                    serviceProviderQuotationDiscountedUnitPrice: d,
                } = rsp;

                if (
                    serviceProviderQuotationSubTotal !== a ||
                    serviceProviderQuotationTotal !== b ||
                    serviceProviderQuotationDiscountAmount !== c ||
                    serviceProviderQuotationDiscountedUnitPrice !== d
                ) {
                    count++;

                    if (sr.hasBeenFulfilled() && !technicalReport.hasBeenCompleted()) {
                        throw new Error("technical report aren't supposed to be altered");
                    }

                    await this.requestedServicePackageRepository.save(rsp);
                }
            }

            if (count < 1) {
                continue;
            }
            patchedCounter++;
        }

        for (const sr of srs) {
            const requestedServicePackages = await this.requestedServicePackageRepository.find({ serviceRequestId: sr.getId() });
            sr.reviseRequestedServicePackages(requestedServicePackages);
            await this.requestedServicePackageRepository.save(sr.customerOrder.servicePackages);
            sr.beforeSave();
            await this.repository.save(sr);
        }

        return patchedCounter;
    }

    async patchPricingDiscrepancyWithAppliedPromoCode(): Promise<ServiceRequest[]> {
        const srList = await this.repository.find({
            where: {
                customerOrder: {
                    consumerPromotionCode: Not(IsNull()),
                },
            },
        });

        const previouslyFixed = [];
        const needsFixing = [];

        for (const sr of srList) {
            const pre = sr.getCustomerOrder().consumerTotal;
            const promoAmount = sr.getCustomerOrder().consumerPromotionAmount;
            sr.resetCustomerOrder();
            const post = sr.getCustomerOrder().consumerTotal;
            if (+pre - +post !== promoAmount) {
                previouslyFixed.push(`already fixed(${sr.getId()}): after promo-code: RM${post}`);
            } else {
                // eslint-disable-next-line max-len
                needsFixing.push(
                    `${sr.getId()}: total w/o promo: RM${pre}, total w/ promo: RM${post}, promo-code: ${
                        sr.getCustomerOrder().consumerPromotionCode
                    }, promo-amount: RM${sr.getCustomerOrder().consumerPromotionAmount}`,
                );
                sr.beforeSave();
                await this.repository.save(sr);
            }

            this.logger.log('........');
        }

        this.logger.log(`total service requests w/ promo-code: ${srList.length}'`);
        this.logger.log(`total previously fixed service requests w/ promo-code: ${previouslyFixed.length}`);
        this.logger.log(previouslyFixed.join('\n'));
        this.logger.log(`total service requests needs fixing: ${needsFixing.length}`);
        this.logger.log(needsFixing.join('\n'));

        return srList;
    }

    async patchTechnicalNotes(id: string, servicePackageId: string, technicalNotes: TechnicalNoteDto[]): Promise<TechnicalNoteDto[]> {
        const sr = await this.repository.findOne(id);
        if (sr === null) {
            throw new EntityNotFoundError('ServiceRequest', id);
        }

        const requestedServicePackage = await this.requestedServicePackageRepository.findOne({
            where: {
                serviceRequestId: id,
                servicePackageId,
            },
        });

        if (!requestedServicePackage) {
            throw new EntityNotFoundError('RequestedServicePackage', `(serviceRequestId:${id}, servicePackageId:${servicePackageId})`);
        }

        requestedServicePackage.replaceNotesInTechnicalReport(technicalNotes);
        await this.requestedServicePackageRepository.save(requestedServicePackage);
        const requestedServicePackages = await this.requestedServicePackageRepository.find({ serviceRequestId: id });

        sr.reviseRequestedServicePackages(requestedServicePackages);
        sr.beforeSave();
        await this.repository.save(sr);

        return technicalNotes;
    }

    async findWithPagination({ ownerId, pagination, status }) {
        const [data, total] = await this.repository.findAndCount({
            where: {
                ...(ownerId && { externalCustomerId: ownerId }),
                service: { status },
            },
            take: pagination.limit,
            skip: pagination.offset,
            order: { createdAt: 'DESC' },
        });

        return {
            data: data.map(sr => sr.toDto()),
            total,
            count: data.length,
            page: pagination.page,
            pageCount: Math.ceil(total / pagination.limit),
        };
    }

    async cancel(id: string): Promise<ServiceRequest> {
        const serviceRequest = await this.get(id);
        const providerId = serviceRequest.getServiceProvider().dispatcher.id;
        const workerId = serviceRequest.getServiceProvider().worker.id;

        serviceRequest.cancelByCustomer();
        serviceRequest.beforeSave();
        serviceRequest.service.eligibleForRefund =
            serviceRequest.service.hasCustomerPaid &&
            serviceRequest.appointment.isExpectedArrivalTimeMoreThanDurationFromNow(
                serviceRequest.getConfig()?.hourLimitBeforeEcRescheduleOptionIsDisabled || 24,
                new Date(),
            );
        await this.repo.save(serviceRequest);
        if (serviceRequest.hasBeenCancelled()) {
            this.eventBus.publish(new ServiceRequestCancelledEvent(serviceRequest, providerId, workerId, UserType.CUSTOMER));
        }
        return serviceRequest;
    }

    async expire(id: string): Promise<ServiceRequest> {
        const serviceRequest = await this.get(id);
        serviceRequest.expiredBySystem();
        serviceRequest.beforeSave();
        await this.repo.save(serviceRequest);
        await this.commandBus.execute(new ExpireJobAssignmentCommand(id));
        this.eventBus.publish(new ServiceRequestFailedEvent(serviceRequest));
        return serviceRequest;
    }

    async findTimedOutServiceRequests() {
        const now = moment
            .utc()
            .subtract(this.appConfig.paymentOptions.processingTimeoutInMinutes, 'minutes')
            .toISOString();

        return this.find({
            createdAt: LessThan(now),
            service: {
                allocationStatus: ServiceAllocationStatusEnum.UNASSIGNED,
                status: ServiceStatusEnum.AWAITING_PAYMENT,
            },
        });
    }

    async refund(id: string, input: RefundInput): Promise<ServiceRequest> {
        const existing = await this.refundService.find({ serviceRequestId: id });

        if (existing?.length > 0) {
            throw new BadRequestException('Unable to refund the service request. The refund already processed');
        }

        await this.refundService.create({
            serviceRequestId: id,
            ...input,
        });

        const serviceRequest = await this.get(id);
        serviceRequest.beforeSave();
        serviceRequest.service.isRefunded = true;
        await this.repo.save(serviceRequest);

        this.eventBus.publish(new ServiceRequestFailedEvent(serviceRequest));

        return this.get(id, [{ field: 'refund', select: undefined }]);
    }
}
