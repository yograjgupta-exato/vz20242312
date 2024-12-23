import { ConfigModule } from '@nestjs/config';
import { CommandBus, CqrsModule, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { AppConfigService } from '@shared/config';
import { Period } from '@shared/entities/period.entity';
import { ServiceProviderType } from '@shared/enums';
import { MockRepository } from '@shared/mocks/mock-repository';
import { ServiceProvider } from '@service-provider/service-provider.entity';
import { ServicePackage } from '@service-package/entities/service-package.entity';
import { ServiceRequestInput } from './dto/service-request.input';
import { AppointmentFactory } from './entities/factories/appointment.factory';
import { CustomerOrderFactory } from './entities/factories/customer-order.factory';
import { ServiceRequestFactory } from './entities/factories/service-request.factory';
import { ReminderProcessor } from './reminder.processor';

// note(roy): following specs will not pass if PAYMENT_GATEWAY_ENABLED = true. I have to mock
// entire config module to have full control over envs in test.
// See github issue: https://github.com/nestjs/config/issues/245#issuecomment-646593207
describe('Reminder Processor', () => {
    let reminderProcessor: ReminderProcessor;
    let commandBus: CommandBus;
    let queryBus: QueryBus;
    let serviceRequestFactory: ServiceRequestFactory;
    let customerOrderFactory: CustomerOrderFactory;
    let appointmentFactory: AppointmentFactory;
    let mockedServicePackageRepo: MockRepository<ServicePackage>;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [CqrsModule, ConfigModule.forRoot({})],
            providers: [
                ReminderProcessor,
                ServiceRequestFactory,
                CustomerOrderFactory,
                AppointmentFactory,
                AppConfigService,
                {
                    provide: getRepositoryToken(ServicePackage),
                    useValue: new MockRepository<ServicePackage>(),
                },
            ],
        })
            .overrideProvider(CommandBus)
            .useValue({
                setModuleRef: jest.fn(),
                register: jest.fn(),
                execute: jest.fn(),
            })
            .overrideProvider(QueryBus)
            .useValue({
                setModuleRef: jest.fn(),
                register: jest.fn(),
                execute: jest.fn(),
            })
            .compile();

        reminderProcessor = module.get<ReminderProcessor>(ReminderProcessor);
        commandBus = module.get<CommandBus>(CommandBus);
        queryBus = module.get<QueryBus>(QueryBus);
        serviceRequestFactory = module.get<ServiceRequestFactory>(ServiceRequestFactory);
        customerOrderFactory = module.get<CustomerOrderFactory>(CustomerOrderFactory);
        appointmentFactory = module.get<AppointmentFactory>(AppointmentFactory);

        mockedServicePackageRepo = module.get(getRepositoryToken(ServicePackage));
    });

    it('should be defined', () => {
        expect(reminderProcessor).toBeDefined();
        expect(commandBus).toBeDefined();
        expect(queryBus).toBeDefined();
        expect(serviceRequestFactory).toBeDefined();
        expect(customerOrderFactory).toBeDefined();

        expect(Reflect.hasMetadata('__bull_module_queue_process', reminderProcessor.handleReminder)).toEqual(true);
    });

    it('should throw error if job data is null', async () => {
        await expect(reminderProcessor.handleReminder(null)).rejects.toThrowError();
    });

    it('should throw error if appointment start time has been changed', async () => {
        const originalAppointmentStartDateTime = '2030-07-19T04:11:04.647Z';
        const updatedAppointmentStartDateTime = '2030-07-19T04:12:04.647Z';

        const sp = new ServicePackage({
            id: '4820511b-0f10-4f3a-8946-a390af0e71c4',
            unitServiceMinutes: 45,
            serviceProviderQuotations: [],
            consumerQuotations: [],
        });
        mockedServicePackageRepo.findOne.mockResolvedValue(sp);

        const serviceRequest = await serviceRequestFactory.create(
            plainToClass(ServiceRequestInput, {
                expectedArrivalPeriod: {
                    end: new Date('2030-07-19T04:11:04.647Z'),
                    start: new Date(originalAppointmentStartDateTime),
                },
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
            }),
        );

        const updatedServiceRequest = await serviceRequestFactory.create(
            plainToClass(ServiceRequestInput, {
                expectedArrivalPeriod: {
                    end: new Date('2030-07-19T04:11:04.647Z'),
                    start: new Date('2030-07-19T04:11:04.647Z'),
                },
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
            }),
        );

        serviceRequest.adminChangeSpecification(
            plainToClass(Period, {
                start: new Date(updatedAppointmentStartDateTime),
            }),
            serviceRequest.customerContact,
            serviceRequest.customerAddress,
            appointmentFactory,
        );

        await expect(reminderProcessor.process(serviceRequest.toDto(), updatedServiceRequest)).rejects.toThrowError();
    });

    it('should not execute command to push notification if current service request has not been assigned', async () => {
        const sp = new ServicePackage({
            id: '4820511b-0f10-4f3a-8946-a390af0e71c4',
            unitServiceMinutes: 45,
            serviceProviderQuotations: [],
            consumerQuotations: [],
        });
        mockedServicePackageRepo.findOne.mockResolvedValue(sp);

        const serviceRequest = await serviceRequestFactory.create(
            plainToClass(ServiceRequestInput, {
                expectedArrivalPeriod: {
                    end: new Date('2030-07-19T04:11:04.647Z'),
                    start: new Date('2030-07-19T04:11:04.647Z'),
                },
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
            }),
        );

        await reminderProcessor.process(serviceRequest.toDto(), serviceRequest);
        expect(commandBus.execute).not.toHaveBeenCalled();
    });

    it('should execute command to push notify once to independent provider if current service request has been assigned', async () => {
        const sp = new ServicePackage({
            id: '4820511b-0f10-4f3a-8946-a390af0e71c4',
            unitServiceMinutes: 45,
            serviceProviderQuotations: [],
            consumerQuotations: [],
        });
        mockedServicePackageRepo.findOne.mockResolvedValue(sp);

        const serviceRequest = await serviceRequestFactory.create(
            plainToClass(ServiceRequestInput, {
                expectedArrivalPeriod: {
                    end: new Date('2030-07-19T04:11:04.647Z'),
                    start: new Date('2030-07-19T04:11:04.647Z'),
                },
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
            }),
        );
        jest.spyOn(serviceRequest, 'hasCustomerPaid').mockImplementationOnce(() => true);

        const independentProvider = new ServiceProvider({
            id: '1',
            type: ServiceProviderType.INDEPENDENT,
        });
        serviceRequest.assignToDispatcher(independentProvider);

        await reminderProcessor.process(serviceRequest.toDto(), serviceRequest);
        expect(commandBus.execute).toHaveBeenCalledTimes(1);
    });

    it('should execute command to push notify both to dealer & worker provider if current service request has been assigned', async () => {
        const sp = new ServicePackage({
            id: '4820511b-0f10-4f3a-8946-a390af0e71c4',
            unitServiceMinutes: 45,
            serviceProviderQuotations: [],
            consumerQuotations: [],
        });
        mockedServicePackageRepo.findOne.mockResolvedValue(sp);

        const serviceRequest = await serviceRequestFactory.create(
            plainToClass(ServiceRequestInput, {
                expectedArrivalPeriod: {
                    end: new Date('2030-07-19T04:11:04.647Z'),
                    start: new Date('2030-07-19T04:11:04.647Z'),
                },
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
            }),
        );
        jest.spyOn(serviceRequest, 'hasCustomerPaid').mockImplementationOnce(() => true);

        const dealer = new ServiceProvider({
            id: '1',
            type: ServiceProviderType.DEALER,
        });
        const worker = new ServiceProvider({
            id: '2',
            type: ServiceProviderType.WORKER,
            dealer,
        });

        serviceRequest.assignToDispatcher(dealer);
        serviceRequest.allocateToWorker(worker, dealer);

        await reminderProcessor.process(serviceRequest.toDto(), serviceRequest);
        expect(commandBus.execute).toHaveBeenCalledTimes(2);
    });
});
