import * as moment from 'moment';
import { EntityRepository, AbstractRepository, In, Raw } from 'typeorm';
import { ServiceAllocationStatusEnum } from '@service-request/entities/service-allocation-status.enum';
import { ServiceRequest } from '@service-request/entities/service-request.entity';
import { ServiceStatusEnum } from '@service-request/entities/service-status.enum';
import { JobSummaryDto } from '@service-provider/dto/job-summary.dto';
import { IServiceProvider } from '@service-provider/interfaces/service-provider.interface';
@EntityRepository(ServiceRequest)
export class ServiceRequestRepository extends AbstractRepository<ServiceRequest> {
    async findOngoingServiceRequestsOfProvider(serviceProvider: IServiceProvider): Promise<ServiceRequest[]> {
        const status = {
            status: In([ServiceStatusEnum.ALLOCATED, ServiceStatusEnum.ASSIGNED, ServiceStatusEnum.STARTED, ServiceStatusEnum.IN_PROGRESS]),
            allocationStatus: In([ServiceAllocationStatusEnum.ASSIGNED, ServiceAllocationStatusEnum.ALLOCATED]),
        };

        const providerOrWorker = serviceProvider.isWorker()
            ? { worker: { id: serviceProvider.getId() } }
            : { dispatcher: { id: serviceProvider.getId() } };

        const serviceRequests = await this.repository.find({
            where: {
                service: {
                    ...status,
                    provider: {
                        ...providerOrWorker,
                    },
                },
            },
        });
        // note(roy): .find doesn't support embed-entity sorting yet. https://github.com/typeorm/typeorm/issues/3508
        return serviceRequests.sort((srA, srB) =>
            moment.utc(srA.appointment.expectedArrivalPeriod.start).diff(moment.utc(srB.appointment.expectedArrivalPeriod.start)),
        );
    }

    async findJobSummaryOfProvider(serviceProvider: IServiceProvider, start: Date, end: Date): Promise<JobSummaryDto> {
        const providerOrWorker = serviceProvider.isWorker()
            ? { worker: { id: serviceProvider.getId() } }
            : { dispatcher: { id: serviceProvider.getId() } };

        const serviceRequests = await this.repository.find({
            where: {
                service: {
                    provider: {
                        ...providerOrWorker,
                    },
                },
                appointment: {
                    expectedArrivalPeriod: {
                        start: Raw(alias => `${alias} >= '${start.toISOString()}' AND ${alias} <= '${end.toISOString()}'`),
                    },
                },
            },
        });

        const jobSummaryDto = new JobSummaryDto();
        jobSummaryDto.completedJobsCount = serviceRequests.filter(sr => sr.hasBeenFulfilled()).length;
        jobSummaryDto.scheduledJobsCount = serviceRequests.filter(sr => sr.isOngoing()).length;
        return jobSummaryDto;
    }

    async findTerminatedServiceRequestsWithMissingWalletTransactions(): Promise<ServiceRequest[]> {
        const query = this.createQueryBuilder('sr')
            .leftJoinAndSelect('sr.walletTransactions', 'trx')
            .select('sr')
            .where('(sr.service.status = :fulfilledStatus OR sr.service.status = :failedStatus)', {
                fulfilledStatus: ServiceStatusEnum.FULFILLED,
                failedStatus: ServiceStatusEnum.FAILED,
            })
            .andWhere('trx.id IS NULL');
        return query.getMany();
    }
}
