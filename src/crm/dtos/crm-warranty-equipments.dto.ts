import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CRMCustomerDto } from './crm-customer.dto';
import { CRMEquipmentDto } from './crm-equipment.dto';

export class CRMWarrantyEquipmentsDto {
    @ApiProperty({
        description: 'The registered customer',
        nullable: false,
    })
    @IsNotEmpty()
    customer!: CRMCustomerDto;

    @ApiProperty({
        description: 'The warranted equipments',
        type: [CRMEquipmentDto],
        nullable: false,
    })
    equipments: CRMEquipmentDto[];

    constructor(customer: CRMCustomerDto, equipments: CRMEquipmentDto[]) {
        this.customer = customer;
        this.equipments = equipments;
    }
}