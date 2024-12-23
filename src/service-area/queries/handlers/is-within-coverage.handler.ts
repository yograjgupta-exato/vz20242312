import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { getCustomRepository } from 'typeorm';
import { IsWithinCoverageQuery } from '../is-within-coverage.query';
import { ServiceAreaRepository } from 'service-area/repository/service-area.repository';

@QueryHandler(IsWithinCoverageQuery)
export class IsWithinCoverageHandler implements IQueryHandler<IsWithinCoverageQuery> {
    async execute(query: IsWithinCoverageQuery): Promise<boolean> {
        const { latLng } = query;

        const serviceAreaRepo = getCustomRepository(ServiceAreaRepository);
        const serviceAreas = await serviceAreaRepo.findServiceAreasByLatLng(latLng);
        return serviceAreas.filter(area => area.isNowWithinCoverage()).length > 0;
    }
}
