import { Logger } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ServiceAllocationStatusEnum } from '@service-request/entities/service-allocation-status.enum';
import { ServiceRequest } from '@service-request/entities/service-request.entity';
import { ServiceStatusEnum } from '@service-request/entities/service-status.enum';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { GetHistoricalServiceRequestsOfProviderQuery } from '@service-request/queries/get-historical-service-requests-of-provider.query';

@QueryHandler(GetHistoricalServiceRequestsOfProviderQuery)
export class GetHistoricalServiceRequestsOfProviderHandler implements IQueryHandler<GetHistoricalServiceRequestsOfProviderQuery> {
    private readonly logger = new Logger(GetHistoricalServiceRequestsOfProviderHandler.name);

    constructor(@InjectRepository(ServiceRequest) private readonly repository: Repository<ServiceRequest>) {}

    async execute(query: GetHistoricalServiceRequestsOfProviderQuery): Promise<IServiceRequest[]> {
        const { providerId } = query;
        const status = {
            status: In([
                ServiceStatusEnum.FULFILLED,
                ServiceStatusEnum.FAILED,
                ServiceStatusEnum.CANCELLED_BY_SERVICE_PROVIDER,
                ServiceStatusEnum.CANCELLED_BY_CUSTOMER,
            ]),
            allocationStatus: In([ServiceAllocationStatusEnum.ASSIGNED, ServiceAllocationStatusEnum.ALLOCATED]),
        };
        const serviceRequests = await this.repository.find({
            where: [
                {
                    service: {
                        ...status,
                        provider: {
                            dispatcher: {
                                id: providerId,
                            },
                        },
                    },
                },
                {
                    service: {
                        ...status,
                        provider: {
                            worker: {
                                id: providerId,
                            },
                        },
                    },
                },
            ],
            order: {
                createdAt: 'DESC',
            },
        });
        if (serviceRequests.length < 0) {
            this.logger.error(`service ticket not found: ${providerId}`);
            return [];
        }
        return serviceRequests;
    }
}
