import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumberString, IsOptional } from 'class-validator';
import * as moment from 'moment';
import { IsDateOnly } from '../../shared/class-validators/is-date-only.validator';
import { StateCode } from '../crm.enum';

// note(roy): c4c to servishub-api mapping
export enum CRMEquipmentMappingKeys {
    ObjectID = 'id',
    SerialID = 'serialId',
    ProductID = 'productId',
    WarrantyID = 'warrantyId',
    WarrantyStartDate = 'warrantyStartDate',
    WarrantyEndDate = 'warrantyEndDate',
    // eslint-disable-next-line @typescript-eslint/camelcase
    KUT_ConsumerRegistrationDate_KUT = 'purchaseDate',
    // eslint-disable-next-line @typescript-eslint/camelcase
    'zWarrantyRegistrationNo_KUT' = 'warrantyRegistrationNo',

    AddressLine1 = 'customerAddressLine1',
    AddressLine2 = 'customerAddressLine2',
    PostalCode = 'customerAddressPostalCode',
    Country = 'customerAddressCountryCode',
    City = 'customerAddressCity',
    StateText = 'customerAddressState',
}

export class CRMEquipmentDto {
    @ApiProperty({
        description: 'The unique identifier of an C4C equipment',
        nullable: false,
    })
    @IsNotEmpty()
    [CRMEquipmentMappingKeys.ObjectID]!: string;

    @ApiProperty({
        description: 'The serial number of an C4C equipment',
        nullable: false,
    })
    @IsNotEmpty()
    [CRMEquipmentMappingKeys.SerialID]!: string;

    @ApiProperty({
        description: 'The material number of an C4C equipment',
        nullable: false,
    })
    @IsNotEmpty()
    materialId!: string;

    @ApiProperty({
        description: 'The product id of an C4C equipment',
        nullable: false,
    })
    @IsNotEmpty()
    [CRMEquipmentMappingKeys.ProductID]!: string;

    @ApiProperty({
        description: 'The master warranty id',
        nullable: true,
    })
    @IsOptional()
    [CRMEquipmentMappingKeys.WarrantyID]?: string;

    @ApiProperty({
        description: 'The master warranty start date (YYYY-MM-DD)',
        nullable: true,
    })
    @IsOptional()
    @IsDateOnly()
    @Transform(d => (d ? moment(d).format('YYYY-MM-DD') : null))
    [CRMEquipmentMappingKeys.WarrantyStartDate]?: string;

    @ApiProperty({
        description: 'The master warranty end date (YYYY-MM-DD)',
        nullable: true,
    })
    @IsOptional()
    @IsDateOnly()
    @Transform(d => (d ? moment(d).format('YYYY-MM-DD') : null))
    [CRMEquipmentMappingKeys.WarrantyEndDate]?: string;

    @ApiProperty({
        description: 'The consumer purchase date (YYYY-MM-DD) of an C4C equipment',
        nullable: true,
    })
    @IsOptional()
    @IsDateOnly()
    @Transform(d => (d ? moment(d).format('YYYY-MM-DD') : null))
    // eslint-disable-next-line @typescript-eslint/camelcase
    [CRMEquipmentMappingKeys.KUT_ConsumerRegistrationDate_KUT]?: string;

    @ApiProperty({
        description: 'The warranty registration number of a C4C equipment',
        nullable: true,
    })
    @IsOptional()
    [CRMEquipmentMappingKeys.zWarrantyRegistrationNo_KUT]?: string;

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
    customerAddressState!: StateCode;

    @ApiProperty({
        description: 'The two-letter code for the country of the address.',
        example: 'MY',
        nullable: false,
    })
    @IsNotEmpty()
    customerAddressCountryCode!: 'MY'; // need to test test code first or text first.

    static fromC4CResponses(equipments: any[]): CRMEquipmentDto[] {
        if (equipments.length < 1) {
            return [];
        }
        return equipments.map(eq => CRMEquipmentDto.fromC4CResponse(eq));
    }

    static fromC4CResponse(equipment: any): CRMEquipmentDto {
        const dto = new CRMEquipmentDto();
        return Object.keys(equipment)
            .filter(key => !!CRMEquipmentMappingKeys[key])
            .reduce((obj, key) => {
                obj[CRMEquipmentMappingKeys[key]] = equipment[key];
                return obj;
            }, dto);
    }
}
