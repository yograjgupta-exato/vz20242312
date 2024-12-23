import { Location } from '@shared/entities/location.entity';

export class LocationDto extends Location {
    formattedAddress: string;

    constructor(location: Location) {
        super();
        this.propertyType = location.propertyType;
        this.company = location.company;
        this.building = location.building;
        this.street1 = location.street1;
        this.street2 = location.street2;
        this.city = location.city;
        this.state = location.state;
        this.postalCode = location.postalCode;
        this.countryCode = location.countryCode;
        this.latitude = location.latitude;
        this.longitude = location.longitude;
        //todo(roy): temporary fix for update case when give locationinput cause it not return Location
        this.formattedAddress = location.toFormattedAddress ? location.toFormattedAddress() : this.toFormattedAddress();
    }

    public toFormattedAddress(): string {
        const addresses = [this.company, this.building, this.street1, this.street2, this.city, this.state, this.postalCode, this.countryCode];
        return addresses.filter(addr => !!addr).join(', ');
    }
}
