import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import moment = require('moment');
import { ServicePackage } from '../../service-package/entities/service-package.entity';
import { AppConfigService } from '../../shared/config';
import { Period } from '../../shared/entities/period.entity';
import {
    UnableToCancelCompletedJobError,
    UnableToCancelRescheduledServiceRequestError,
    UnableToRescheduleServiceRequestDueToUnpaidSurchargeError,
    UnableToRescheduleServiceRequestError,
} from '../../shared/errors';
import { MockRepository } from '../../shared/mocks/mock-repository';
import { ServiceRequestInput } from '../dto/service-request.input';
import { Agent } from './agent.entity';
import { AppointmentFactory } from './factories/appointment.factory';
import { CustomerOrderFactory } from './factories/customer-order.factory';
import { ServiceRequestFactory } from './factories/service-request.factory';
import { Provider } from './provider.entity';
import { ServiceRequest } from './service-request.entity';
import { ServiceStatusEnum } from './service-status.enum';

// subject to override
const getDefaultServiceRequestInput = (appointmentStartDateTime?: Date) =>
    plainToClass(ServiceRequestInput, {
        expectedArrivalPeriod: plainToClass(Period, {
            end: new Date('2030-07-19T04:11:04.647Z'),
            start: appointmentStartDateTime ?? new Date('2030-07-19T04:11:04.647Z'),
        }),
        customerAddress: {
            building: 'string',
            company: 'string',
            city: 'string',
            countryCode: 'string',
            latitude: 3.1068,
            longitude: 101.7259,
            state: 'string',
            street1: 'string',
            street2: 'string',
            postalCode: '56100',
            propertyType: 'LANDED',
        },
        customerContact: {
            email: 'cchitsiang@hotmail.com',
            name: 'Chew Chit Siang',
            phone: '+60167228527',
            secondaryPhone: '+60167228527',
        },
        customerOrder: {
            remarks: 'Wait me at guardhouse will bring up once you arrived',
            servicePackages: [
                {
                    id: '4820511b-0f10-4f3a-8946-a390af0e71c4',
                    quantity: 1,
                },
            ],
            total: 0,
        },
    });

const getDefaultServicePackageInput = () =>
    new ServicePackage({
        id: '4820511b-0f10-4f3a-8946-a390af0e71c4',
        unitServiceMinutes: 45,
        serviceProviderQuotations: [],
        consumerQuotations: [],
    });

describe('Service Request', () => {
    let serviceRequestFactory: ServiceRequestFactory;
    let appointmentFactory: AppointmentFactory;
    let mockedServicePackageRepo: MockRepository<ServicePackage>;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [CqrsModule, ConfigModule.forRoot({})],
            providers: [
                ServiceRequestFactory,
                CustomerOrderFactory,
                AppointmentFactory,
                AppConfigService,
                {
                    provide: getRepositoryToken(ServicePackage),
                    useValue: new MockRepository<ServicePackage>(),
                },
            ],
        }).compile();

        serviceRequestFactory = module.get<ServiceRequestFactory>(ServiceRequestFactory);
        appointmentFactory = module.get<AppointmentFactory>(AppointmentFactory);

        mockedServicePackageRepo = module.get(getRepositoryToken(ServicePackage));
        mockedServicePackageRepo.findOne.mockResolvedValue(getDefaultServicePackageInput());
    });

    describe('reschedule', () => {
        let serviceRequest: ServiceRequest;
        const appointmentStartDateTime = new Date('2030-07-19T04:11:04.647Z');
        beforeEach(async () => {
            serviceRequest = await serviceRequestFactory.create(getDefaultServiceRequestInput(appointmentStartDateTime));
            serviceRequest.changeConfiguration({
                hourLimitBeforeEcRescheduleSurchageIsRequired: 12,
                hourLimitBeforeEcRescheduleOptionIsDisabled: 3,
            });
            serviceRequest.service.status = ServiceStatusEnum.UNASSIGNED;
        });

        describe('Customer has already paid the Service Fee', () => {
            beforeEach(() => {
                jest.spyOn(serviceRequest, 'hasCustomerPaid').mockImplementation(() => true);
            });

            describe('#allowReschedule', () => {
                it('should allow reschedule prior any specification changed', () => {
                    expect(serviceRequest.allowReschedule()).toBe(true);
                });

                it('should not allow reschedule if its already been rescheduled once', () => {
                    const firstReschedule = new Date('2030-07-17T04:11:04.647Z');
                    serviceRequest.createCustomerRescheduleOrder(
                        appointmentFactory,
                        plainToClass(Period, {
                            start: new Date(firstReschedule),
                        }),
                    );

                    serviceRequest.executeCustomerRescheduleOrder(appointmentFactory);
                    expect(serviceRequest.allowReschedule()).toBe(false);
                });
            });

            describe('#allowRescheduleWithoutSurcharge', () => {
                it.each`
                    hoursLimitBeforeSurgeCharge | hoursAwayFromAppointment | allowRescheduleWithoutSurcharge
                    ${12}                       | ${12}                    | ${true}
                    ${12}                       | ${11}                    | ${false}
                    ${12}                       | ${4}                     | ${false}
                    ${12}                       | ${-1}                    | ${false}
                    ${12}                       | ${13}                    | ${true}
                `(
                    'returns $allowRescheduleWithoutSurcharge if appointment is $hoursAwayFromAppointment hours away from appointment',
                    ({ allowRescheduleWithoutSurcharge, hoursLimitBeforeSurgeCharge, hoursAwayFromAppointment }) => {
                        serviceRequest.changeConfiguration({
                            hourLimitBeforeEcRescheduleSurchageIsRequired: hoursLimitBeforeSurgeCharge,
                        });

                        const now = moment(appointmentStartDateTime).add(-hoursAwayFromAppointment, 'hour');
                        expect(serviceRequest.allowRescheduleWithoutSurcharge(now.toDate())).toBe(allowRescheduleWithoutSurcharge);
                    },
                );
            });

            describe('#createCustomerRescheduleOrder', () => {
                it('should throw error if new appointment start time is the same as current one', () => {
                    expect(() =>
                        serviceRequest.createCustomerRescheduleOrder(
                            appointmentFactory,
                            plainToClass(Period, {
                                start: appointmentStartDateTime,
                            }),
                        ),
                    ).toThrowError('Unnecessary rescheduling: New appointment start time is the same as current one');
                });

                it('should throw UnableToRescheduleServiceRequestError if its already been rescheduled once', async () => {
                    const firstReschedule = new Date('2030-07-17T04:11:04.647Z');
                    serviceRequest.createCustomerRescheduleOrder(
                        appointmentFactory,
                        plainToClass(Period, {
                            start: new Date(firstReschedule),
                        }),
                    );
                    serviceRequest.executeCustomerRescheduleOrder(appointmentFactory);

                    const secondReschedule = new Date('2030-07-18T04:11:04.647Z');
                    expect(() =>
                        serviceRequest.createCustomerRescheduleOrder(
                            appointmentFactory,
                            plainToClass(Period, {
                                start: new Date(secondReschedule),
                            }),
                        ),
                    ).toThrow(UnableToRescheduleServiceRequestError);
                });

                describe('reschedule after free-of-charge period', () => {
                    beforeEach(() => {
                        jest.spyOn(serviceRequest, 'allowReschedule').mockImplementationOnce(() => true);
                        jest.spyOn(serviceRequest, 'allowRescheduleWithoutSurcharge').mockImplementationOnce(() => false);
                    });

                    describe('config.paymentGatewayEnabled = true', () => {
                        beforeEach(() => {
                            serviceRequest.changeConfiguration({
                                paymentGatewayEnabled: true,
                            });
                        });
                        it('should throw UnableToRescheduleServiceRequestDueToUnpaidSurchargeError', () => {
                            const firstReschedule = new Date('2030-07-17T04:11:04.647Z');
                            expect(() =>
                                serviceRequest.createCustomerRescheduleOrder(
                                    appointmentFactory,
                                    plainToClass(Period, {
                                        start: new Date(firstReschedule),
                                    }),
                                ),
                            ).toThrow(UnableToRescheduleServiceRequestDueToUnpaidSurchargeError);
                        });

                        it('should create reschedule order with surcharge if surgeAmount > 0', () => {
                            serviceRequest.changeConfiguration({
                                ecRescheduleSurchargeAmount: 1,
                            });

                            const firstReschedule = new Date('2030-07-17T04:11:04.647Z');
                            expect(() =>
                                serviceRequest.createCustomerRescheduleOrder(
                                    appointmentFactory,
                                    plainToClass(Period, {
                                        start: new Date(firstReschedule),
                                    }),
                                ),
                            ).toThrow(UnableToRescheduleServiceRequestDueToUnpaidSurchargeError);
                            expect(serviceRequest.customerRescheduleOrder.surchargeRequired).toBe(true);
                        });

                        it('should not throw UnableToRescheduleServiceRequestDueToUnpaidSurchargeError if surchargeAmount = 0', () => {
                            const firstReschedule = new Date('2030-07-17T04:11:04.647Z');
                            serviceRequest.changeConfiguration({
                                ecRescheduleSurchargeAmount: 0,
                            });
                            expect(() =>
                                serviceRequest.createCustomerRescheduleOrder(
                                    appointmentFactory,
                                    plainToClass(Period, {
                                        start: new Date(firstReschedule),
                                    }),
                                ),
                            ).not.toThrow(UnableToRescheduleServiceRequestDueToUnpaidSurchargeError);
                        });

                        it('should create reschedule order without surcharge if surchargeAmount = 0', () => {
                            serviceRequest.changeConfiguration({
                                ecRescheduleSurchargeAmount: 0,
                            });

                            const firstReschedule = new Date('2030-07-17T04:11:04.647Z');
                            serviceRequest.createCustomerRescheduleOrder(
                                appointmentFactory,
                                plainToClass(Period, {
                                    start: new Date(firstReschedule),
                                }),
                            );
                            expect(serviceRequest.customerRescheduleOrder.surchargeRequired).toBe(false);
                        });

                        it('should create reschedule order with impacted service provider (if any)', () => {
                            const spId = '1';
                            jest.spyOn(serviceRequest, 'getServiceProvider').mockImplementationOnce(
                                () => new Provider(new Agent(spId, null, null, null), null, null),
                            );
                            const firstReschedule = new Date('2030-07-17T04:11:04.647Z');
                            expect(() =>
                                serviceRequest.createCustomerRescheduleOrder(
                                    appointmentFactory,
                                    plainToClass(Period, {
                                        start: new Date(firstReschedule),
                                    }),
                                ),
                            ).toThrow(UnableToRescheduleServiceRequestDueToUnpaidSurchargeError);

                            expect(serviceRequest.customerRescheduleOrder.impactedServiceProviderId).toBe(spId);
                        });
                    });

                    describe('config.paymentGatewayEnabled = false', () => {
                        beforeEach(() => {
                            serviceRequest.changeConfiguration({
                                paymentGatewayEnabled: false,
                            });
                        });
                        it('should not throw UnableToRescheduleServiceRequestDueToUnpaidSurchargeError', () => {
                            const firstReschedule = new Date('2030-07-17T04:11:04.647Z');
                            expect(() =>
                                serviceRequest.createCustomerRescheduleOrder(
                                    appointmentFactory,
                                    plainToClass(Period, {
                                        start: new Date(firstReschedule),
                                    }),
                                ),
                            ).not.toThrow(UnableToRescheduleServiceRequestDueToUnpaidSurchargeError);
                        });

                        it('should create reschedule order without surcharge if surgeAmount > 0', () => {
                            serviceRequest.changeConfiguration({
                                ecRescheduleSurchargeAmount: 1,
                            });

                            const firstReschedule = new Date('2030-07-17T04:11:04.647Z');
                            serviceRequest.createCustomerRescheduleOrder(
                                appointmentFactory,
                                plainToClass(Period, {
                                    start: new Date(firstReschedule),
                                }),
                            );
                            expect(serviceRequest.customerRescheduleOrder.surchargeRequired).toBe(false);
                        });

                        it('should create reschedule order with impacted service provider (if any)', () => {
                            const spId = '1';
                            jest.spyOn(serviceRequest, 'getServiceProvider').mockImplementationOnce(
                                () => new Provider(new Agent(spId, null, null, null), null, null),
                            );
                            const firstReschedule = new Date('2030-07-17T04:11:04.647Z');
                            serviceRequest.createCustomerRescheduleOrder(
                                appointmentFactory,
                                plainToClass(Period, {
                                    start: new Date(firstReschedule),
                                }),
                            );

                            expect(serviceRequest.customerRescheduleOrder.impactedServiceProviderId).toBe(spId);
                        });
                    });
                });

                describe('reschedule during free-of-charge period', () => {
                    beforeEach(() => {
                        jest.spyOn(serviceRequest, 'allowReschedule').mockImplementationOnce(() => true);
                        jest.spyOn(serviceRequest, 'allowRescheduleWithoutSurcharge').mockImplementationOnce(() => true);
                    });

                    it('should reschedule order without surcharge', () => {
                        const firstReschedule = new Date('2030-07-17T04:11:04.647Z');
                        serviceRequest.createCustomerRescheduleOrder(
                            appointmentFactory,
                            plainToClass(Period, {
                                start: new Date(firstReschedule),
                            }),
                        );
                        expect(serviceRequest.customerRescheduleOrder.surchargeRequired).toBe(false);
                    });

                    it('should create reschedule order with impacted service provider (if any)', () => {
                        const spId = '1';
                        jest.spyOn(serviceRequest, 'getServiceProvider').mockImplementationOnce(
                            () => new Provider(new Agent(spId, null, null, null), null, null),
                        );
                        const firstReschedule = new Date('2030-07-17T04:11:04.647Z');
                        serviceRequest.createCustomerRescheduleOrder(
                            appointmentFactory,
                            plainToClass(Period, {
                                start: new Date(firstReschedule),
                            }),
                        );

                        expect(serviceRequest.customerRescheduleOrder.impactedServiceProviderId).toBe(spId);
                    });
                });
            });
        });
    });

    describe('cancelByCustomer', () => {
        let serviceRequest: ServiceRequest;
        beforeEach(async () => {
            serviceRequest = await serviceRequestFactory.create(getDefaultServiceRequestInput());
            serviceRequest.service.status = ServiceStatusEnum.ALLOCATED;
        });

        it('should throw UnableToCancelRescheduledServiceRequestError if it has been rescheduled once', () => {
            jest.spyOn(serviceRequest, 'hasCustomerPaid').mockImplementationOnce(() => true);
            jest.spyOn(serviceRequest, 'hasBeenRescheduledOnce').mockImplementationOnce(() => true);
            jest.spyOn(serviceRequest, 'hasBeenFulfilled').mockImplementationOnce(() => false);

            expect(() => serviceRequest.cancelByCustomer()).toThrow(UnableToCancelRescheduledServiceRequestError);
            expect(serviceRequest.hasBeenCancelled()).toBe(false);
        });

        it('should throw UnableToCancelCompletedJobError if it has already completed', () => {
            jest.spyOn(serviceRequest, 'hasCustomerPaid').mockImplementationOnce(() => true);
            jest.spyOn(serviceRequest, 'hasBeenRescheduledOnce').mockImplementationOnce(() => false);
            jest.spyOn(serviceRequest, 'hasBeenFulfilled').mockImplementationOnce(() => true);

            expect(() => serviceRequest.cancelByCustomer()).toThrow(UnableToCancelCompletedJobError);
            expect(serviceRequest.hasBeenCancelled()).toBe(false);
        });

        // todo(roy): check if ec-cancellation already past window period
        it.skip('should allow customer to cancel if it has not both rescheduled & fulfilled', () => {
            jest.spyOn(serviceRequest, 'hasBeenRescheduledOnce').mockImplementationOnce(() => false);
            jest.spyOn(serviceRequest, 'hasBeenFulfilled').mockImplementationOnce(() => false);

            serviceRequest.cancelByCustomer();

            expect(serviceRequest.hasBeenCancelled()).toBe(true);
        });
    });
});
