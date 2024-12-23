import { QueryHandler, IQueryHandler, QueryBus } from '@nestjs/cqrs';
import { getCustomRepository } from 'typeorm';
import { EntityNotFoundError } from '@shared/errors';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { GetServiceRequestQuery } from '@service-request/queries/get-service-request.query';
import { ServiceProviderRepository } from '@service-provider/repository/service-provider.repository';
import { GetCandidatesQuery } from '../get-candidates.query';
import { CandidateDto } from 'dispatching/dto/candidate.dto';

@QueryHandler(GetCandidatesQuery)
export class GetCandidatesHandler implements IQueryHandler<GetCandidatesQuery> {
    constructor(private readonly queryBus: QueryBus) {}

    // refactor(roy): return a ServiceProviderDto instead (+distance attribute)
    // todo(roy): missing criteria scan+filter of service providers.
    async execute(query: GetCandidatesQuery): Promise<CandidateDto[]> {
        const { serviceRequestId } = query;

        const serviceProviderRepository = getCustomRepository(ServiceProviderRepository);

        const serviceRequest: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(serviceRequestId));
        if (!serviceRequest) {
            throw new EntityNotFoundError('ServiceRequest', serviceRequestId);
        }

        const serviceProviders = await serviceProviderRepository.findOnDutyDealerOrIndependents(serviceRequest.getEntitlement());
        let candidates = serviceProviders.map(sp => {
            let c = new CandidateDto();
            c = sp;
            c.distanceKm = serviceRequest.distanceTo(c.latitude, c.longitude);
            return c;
        });

        if (serviceRequest.hasSurpassedHourLimitBeforeActivatingEmergencyCandidateScanningZone()) {
            candidates = candidates.filter(sp => sp.distanceKm <= serviceRequest.getConfig().emergencyCandidateScanningZoneRadiusInKm);
        }
        // refactor(roy): move Haversine formula to sql level.
        return candidates.sort((sp1, sp2) => sp1.distanceKm - sp2.distanceKm);
    }
}
