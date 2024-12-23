import { LatLngDto } from '@service-provider/dto/lat-lng.dto';
import { ScanningZoneTypeEnum } from 'dispatching/enums/scanning-zone-type.enum';

export class ScanCandidatesQuery {
    constructor(
        public readonly scanningZoneType: ScanningZoneTypeEnum,
        public readonly latLng: LatLngDto,
        public readonly postalCode: string,
        public readonly excludeServiceProviderIds: string[],
        public readonly serviceRequestEntitlement: number,
        public readonly limit?: number,
    ) {}
}
