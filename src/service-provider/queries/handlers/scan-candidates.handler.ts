import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { getCustomRepository } from 'typeorm';
import { IServiceProvider } from '@service-provider/interfaces/service-provider.interface';
import { ServiceProviderRepository } from '@service-provider/repository/service-provider.repository';
import { ScanningZoneTypeEnum } from '../../../dispatching/enums/scanning-zone-type.enum';
import { ServiceAreaRepository } from '../../../service-area/repository/service-area.repository';
import { ScanCandidatesQuery } from '../scan-candidates.query';
import { IServiceArea } from 'service-area/entities/interfaces/service-area.interface';

@QueryHandler(ScanCandidatesQuery)
export class ScanCandidatesHandler implements IQueryHandler<ScanCandidatesQuery> {
    async execute(query: ScanCandidatesQuery): Promise<IServiceProvider[]> {
        const { scanningZoneType, serviceRequestEntitlement, postalCode, latLng } = query;
        const serviceProviderRepository = getCustomRepository(ServiceProviderRepository);
        const serviceAreaRepository = getCustomRepository(ServiceAreaRepository);

        let serviceAreas: IServiceArea[] = [];
        switch (scanningZoneType) {
            case ScanningZoneTypeEnum.POSTAL_CODE:
                serviceAreas = await serviceAreaRepository.findServiceAreaByPostalCode(postalCode);
                break;
            case ScanningZoneTypeEnum.POLYGON:
                serviceAreas = await serviceAreaRepository.findServiceAreasByLatLng(latLng);
                break;
            case ScanningZoneTypeEnum.ALL:
                serviceAreas = [
                    ...(await serviceAreaRepository.findServiceAreaByPostalCode(postalCode)),
                    ...(await serviceAreaRepository.findServiceAreasByLatLng(latLng)),
                ];
            default:
                return this.distinct(await serviceProviderRepository.findOnDutyDealerOrIndependents(serviceRequestEntitlement, false));
        }
        const coveredServiceAreas = serviceAreas.filter(sa => sa.isNowWithinCoverage());
        if (coveredServiceAreas.length < 1) {
            return [];
        }

        return this.distinct(
            await serviceProviderRepository.findOnDutyDealersOrIndependentsWithinCoverage(
                serviceAreas.filter(sa => sa.isNowWithinCoverage()),
                [],
                0,
            ),
        );
    }

    private distinct(serviceProviders: IServiceProvider[]) {
        const exists = {};
        return serviceProviders.filter(sp => {
            if (!exists[sp.getId()]) {
                exists[sp.getId()] = true;
                return true;
            }
            return false;
        });
    }
}
