import { LatLngDto } from '@service-provider/dto/lat-lng.dto';

export class IsWithinCoverageQuery {
    constructor(public readonly latLng: LatLngDto) {}
}
