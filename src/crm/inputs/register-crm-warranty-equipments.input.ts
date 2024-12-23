import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsNumberString, IsOptional } from 'class-validator';
import { IsDateOnly } from '../../shared/class-validators/is-date-only.validator';
import { Race, StateCode } from '../crm.enum';

export class RegisterCrmWarrantyEquipmentsInput {
    @ApiProperty({
        description: 'The list of respective c4c-unique-identifiers of equipments for warranty registration. Note: do not use serialId.',
        example: ['00163E80BF881EE9A7DF6959AA7C554B'],
        nullable: false,
    })
    @IsNotEmpty()
    equipmentIds!: string[];

    @ApiProperty({
        description: 'The purchase date (YYYY-MM-DD) of the listed equipments',
        nullable: false,
        example: '2021-02-28',
    })
    @IsDateOnly()
    equipmentPurchaseDate!: string;

    @ApiProperty({
        description: 'The first name of customer.',
        example: 'David',
        nullable: false,
    })
    @IsNotEmpty()
    customerFirstName!: string;

    @ApiProperty({
        description: 'The last name of customer.',
        example: 'Wong',
        nullable: false,
    })
    @IsNotEmpty()
    customerLastName!: string;

    // 1. create customer if not exists
    // 2. link c4c customer id with equipment id above.
    @ApiProperty({
        description: 'The customer phone number.',
        nullable: false,
        example: '60166833704',
    })
    @IsNotEmpty()
    customerPhone!: string;

    @ApiProperty({
        description: 'The customer email address.',
        nullable: false,
        example: 'customer@demo.com',
    })
    @IsNotEmpty()
    @IsEmail()
    @Transform(email => email.toLowerCase())
    customerEmail!: string;

    @ApiProperty({
        description: "Customer's race",
        example: Race.OTHER,
        type: 'enum',
    })
    @IsOptional()
    customerRace?: Race;

    // 3. following is to tag customer address in equipment.
    @ApiProperty({
        description: 'The first line of the address. Typically the street address or PO Box number.',
        example: 'No. 51 M Jln Ss21/56B Ss21',
        nullable: false,
    })
    customerAddressLine1!: string;

    @ApiProperty({
        description: 'The second line of the address. Typically the number of the apartment, suite, or unit.',
        example: '',
        nullable: true,
    })
    @IsOptional()
    customerAddressLine2?: string;

    @ApiProperty({
        description: 'The name of the city, district, village, or town.',
        example: 'Petaling Jaya',
        nullable: true,
    })
    @IsOptional()
    customerAddressCity?: string;

    @ApiProperty({
        description: 'The zip or postal code of the address.',
        example: '47400',
        nullable: false,
    })
    @IsNumberString()
    @IsNotEmpty()
    customerAddressPostalCode!: string;

    @ApiProperty({
        description: 'The region of the address, such as the province, state, or district',
        example: StateCode.SEL,
        nullable: false,
        type: 'enum',
    })
    @IsNotEmpty()
    @Transform(state => {
        const reverseMode = new Map<string, StateCode>();
        Object.keys(StateCode).forEach((mode: StateCode) => {
            const modeValue: string = StateCode[mode];
            reverseMode.set(modeValue, mode);
        });
        return reverseMode.get(state);
    })
    customerAddressState!: StateCode;

    @ApiProperty({
        description: 'The two-letter code for the country of the address.',
        example: 'MY',
        nullable: false,
    })
    @IsNotEmpty()
    customerAddressCountryCode!: 'MY'; // need to test test code first or text first.

    toC4CPayload(): any {
        return {
            AddressLine1: this.customerAddressLine1,
            AddressLine2: this.customerAddressLine2,
            PostalCode: this.customerAddressPostalCode,
            Country: this.customerAddressCountryCode,
            City: this.customerAddressCity,
            State: this.customerAddressState,
            // eslint-disable-next-line @typescript-eslint/camelcase
            KUT_ConsumerRegistrationDate_KUT: `/Date(${new Date(this.equipmentPurchaseDate).getTime()})/`,
        };
    }
}
