import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumberString, IsOptional } from 'class-validator';
import { Race, StateCode } from '../crm.enum';

export enum CRMCustomerMappingKeys {
    CustomerID = 'id',
    FirstName = 'firstName',
    LastName = 'lastName',
    FormattedName = 'formattedName',
    RoleCode = 'roleCode',
    Phone = 'phone',
    Email = 'email',
    AddressLine1 = 'addressLine1',
    AddressLine2 = 'addressLine2',
    StreetPostalCode = 'addressPostalCode',
    CountryCode = 'addressCountryCode',
    City = 'addressCity',
    StateCodeText = 'addressState',
    // eslint-disable-next-line @typescript-eslint/camelcase
    zRace_KUT = 'race',
}

/**
 *
 * Create New CRM-Customer
 * --------------------
 * In this project, we capture customer's mobile/phone as '60166833704' in service-request table, column 'customer_contact_number'.
 * Note that we intentionally leave out the prefix '+'zz  .
 *
 * When we create CRM customer with '60166833704', it formats and stores phone/mobile as following:
 * - phone: '60166833704'.
 * - sanitizedPhone: '60166833704'
 * - mobile: '60166833704'
 * - sanitizedMobile: '60166833704'
 *
 * Hence, you may use the same phone/mobile value stored in service-request table to filter customer by mobile/phone.
 *
 *--------------------------------------------------------------
 * Observation(roy): while playing with crm-customer endpoint.
 * - If you create crm-customer with annotated phone (+ and -): +6016-6833704, you will not be able to query back later with `param: phone` later.
 * - Hence, to ensure 'searchability', please use phone without annotations/symbols (country-code is fine), i.e: 60166833704
 */
export class CRMCustomerDto {
    @ApiProperty({
        description: 'The unique identifier of customer',
    })
    [CRMCustomerMappingKeys.CustomerID]: string;

    @ApiProperty({
        description: 'The formatted name of customer',
    })
    [CRMCustomerMappingKeys.FormattedName]: string;

    @ApiProperty({
        description: 'The first name of customer',
        example: 'David'
    })
    @IsNotEmpty()
    [CRMCustomerMappingKeys.FirstName]: string;

    @ApiProperty({
        description: 'The last name of customer',
        example: 'Wong'
    })
    @IsNotEmpty()
    [CRMCustomerMappingKeys.LastName]: string;

    @ApiProperty({
        description: 'The first line of the address. Typically the street address or PO Box number.',
        example: 'No. 51 M Jln Ss21/56B Ss21',
        nullable: false,
    })
    [CRMCustomerMappingKeys.AddressLine1]: string;

    @ApiProperty({
        description: 'The second line of the address. Typically the number of the apartment, suite, or unit.',
        example: '',
        nullable: true,
    })
    @IsOptional()
    [CRMCustomerMappingKeys.AddressLine2]?: string;

    @ApiProperty({
        description: 'The name of the city, district, village, or town.',
        example: 'Petaling Jaya',
        nullable: true,
    })
    @IsOptional()
    [CRMCustomerMappingKeys.City]: string;

    @ApiProperty({
        description: 'The zip or postal code of the address.',
        example: '47400',
        nullable: false,
    })
    @IsNumberString()
    @IsNotEmpty()
    [CRMCustomerMappingKeys.StreetPostalCode]: string;

    @ApiProperty({
        description: 'The region of the address, such as the province, state, or district',
        example: StateCode.SEL,
        nullable: false,
        type: 'enum',
    })
    @IsNotEmpty()
    [CRMCustomerMappingKeys.StateCodeText]: string; // need to test test code first or text first.

    @ApiProperty({
        description: 'The two-letter code for the country of the address.',
        example: 'MY',
        nullable: false,
    })
    @IsNotEmpty()
    [CRMCustomerMappingKeys.CountryCode]: 'MY';

    @ApiProperty({
        description: 'The role of customer',
        default: 'CRM000',
        example: 'CRM000',
    })
    @IsNotEmpty()
    [CRMCustomerMappingKeys.RoleCode]: string;


    @ApiProperty({
        description: 'The email of customer',
        example: 'customer@demo.com',
        nullable: false,
    })
    @IsEmail()
    @IsNotEmpty()
    [CRMCustomerMappingKeys.Email]: string;

    @ApiProperty({
        description: "The digitized version of customer's contact number. Note: Do not include + and - annotation",
        example: '60166833704',
    })
    @IsNotEmpty()
    [CRMCustomerMappingKeys.Phone]: string;

    @ApiProperty({
        description: "Customer's race",
        example: Race.OTHER,
        type: 'enum',
    })
    @IsOptional()
    [CRMCustomerMappingKeys.zRace_KUT]?: Race;

    static fromC4CResponse(customer: any): CRMCustomerDto {
        if (!customer) {
            return null;
        }
        const dto = new CRMCustomerDto();

        return Object.keys(customer)
            .filter(key => !!CRMCustomerMappingKeys[key])
            .reduce((obj, key) => {
                obj[CRMCustomerMappingKeys[key]] = customer[key];
                return obj;
            }, dto);
    }
}
