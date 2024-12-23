import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';
import { Column } from 'typeorm';
import { PropertyTypeEnum } from '@service-request/enums/property-type.enum';

export class Location {
    @ApiProperty({
        description: "The name of the customer's building.",
    })
    @Column({
        comment: "The name of the customer's building.",
        name: '_building',
        nullable: true,
    })
    building?: string;

    @ApiProperty({
        description: "The name of the customer's company or organization.",
    })
    @Column({
        comment: "The name of the customer's company or organization.",
        name: '_company',
        nullable: true,
    })
    company?: string;

    @ApiProperty({
        description: 'The name of the city, district, village, or town.',
    })
    @Column({
        comment: 'The name of the city, district, village, or town.',
        name: '_city',
        nullable: true,
    })
    city: string;

    @ApiProperty({
        description: 'The two-letter code for the country of the address.',
    })
    @Column({
        comment: 'The two-letter code for the country of the address.',
        name: '_country_code',
    })
    countryCode: string;

    @ApiProperty({
        description: 'The latitude coordinates of the location',
        example: 3.1068,
        format: 'float',
        type: 'number',
    })
    @Column('decimal', {
        comment: 'The latitude coordinates of the location',
        name: '_latitude',
        nullable: true,
        precision: 10,
        scale: 6,
    })
    latitude?: number;

    @ApiProperty({
        description: 'The longitude coordinates of the location',
        example: 101.7259,
        format: 'float',
        type: 'number',
    })
    @Column('decimal', {
        comment: 'The longitude coordinates of the location',
        name: '_longitude',
        nullable: true,
        precision: 10,
        scale: 6,
    })
    longitude?: number;

    @ApiProperty({
        description: 'The code for the region of the address, such as the province, state, or district. For example KL for Kuala Lumpur, Malaysia',
    })
    @Column({
        comment: 'The code for the region of the address, such as the province, state, or district. For example KL for Kuala Lumpur, Malaysia',
        name: '_state',
    })
    // todo(roy): add state code validation
    state: string;

    @ApiProperty({
        description: 'The first line of the address. Typically the street address or PO Box number.',
    })
    @Column({
        comment: 'The first line of the address. Typically the street address or PO Box number.',
        name: '_street1',
    })
    street1: string;

    @ApiProperty({
        description: 'The second line of the address. Typically the number of the apartment, suite, or unit.',
    })
    @Column({
        comment: 'The second line of the address. Typically the number of the apartment, suite, or unit.',
        name: '_street2',
        nullable: true,
    })
    street2?: string;

    @ApiProperty({
        description: 'The zip or postal code of the address.',
    })
    @Column({
        comment: 'The zip or postal code of the address.',
        name: '_postal_code',
    })
    @IsNumberString()
    postalCode: string;

    @ApiProperty({
        description: 'The building type of the address.',
    })
    @Column({
        comment: 'The building type of the address.',
        default: PropertyTypeEnum.CONDO,
        enum: PropertyTypeEnum,
        name: '_property_type',
        type: 'enum',
    })
    propertyType: PropertyTypeEnum;

    public toFormattedAddress(): string {
        const addresses = [this.company, this.building, this.street1, this.street2, this.city, this.state, this.postalCode, this.countryCode];
        return addresses.filter(addr => !!addr).join(', ');
    }
}
