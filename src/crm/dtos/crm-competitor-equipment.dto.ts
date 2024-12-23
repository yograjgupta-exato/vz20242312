import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { Equipment } from 'equipment/equipment.entity';

export class CRMCompetitorEquipmentAttachmentDto {
    @ApiProperty({
        default: '3',
        description: "If left blank, default will be 'Document'.\n2 - Document\n3-Link",
        example: '3',
    })
    CategoryCode: string;

    @ApiProperty({
        description: 'The url to attachment',
        example: 'https://competitor-eq.jpg',
    })
    LinkWebURI: string;

    @ApiProperty({
        description: 'The name(file) of attachment',
        example: 'competitor-eq.jpg',
    })
    Name: string;

    @ApiProperty({
        default: '10013',
        description: "If left blank, default will be 'Standard Attachment'.\n10001 - Standard Attachment\n10013 - Image",
        example: '10013',
    })
    TypeCode: string;

    static fromAttachmentUrls(attachmentUrls: string[]): CRMCompetitorEquipmentAttachmentDto[] {
        return attachmentUrls.map(attachmentUrl => {
            const dto = new CRMCompetitorEquipmentAttachmentDto();
            dto.CategoryCode = '3';
            dto.LinkWebURI = attachmentUrl;
            dto.Name = attachmentUrl;
            dto.TypeCode = '10013';
            return dto;
        });
    }
}

export class CRMCompetitorEquipmentDto {
    @ApiProperty({
        description: `The unique identifier of an air-conditional.\n
        Note#1: Mandatory on insertion.\n
        Note#2: Its value will be formatted to upper-case at c4c end.`,
    })
    id: string;

    @ApiProperty({
        description: 'The manufacture year of an air-conditional',
        example: '2020',
    })
    manufactureYear: string;

    @ApiProperty({
        description: 'The horse power of an air-conditional',
    })
    horsePower: string;

    @ApiProperty({
        description: 'The brand of an air-conditional',
    })
    brand: string;

    @ApiProperty({
        description: 'The model of an air-conditional',
    })
    model: string;

    @ApiProperty({
        description: '',
        nullable: true,
    })
    remark?: string;

    @ApiProperty({
        description: 'The serial number of an air-conditional. Note: its value allows to be duplicated at c4c.',
    })
    serialNo: string;

    @ApiProperty({
        description: '',
        example: 'EA',
    })
    @IsIn(['EA'])
    unitType: string;

    @ApiProperty({
        description: 'The unique identification of crm-customer',
    })
    customerID: string;

    @ApiProperty({
        description: 'The sap vendor id of service provider',
    })
    SP_ID: string;

    @ApiProperty({
        description: '',
        type: [CRMCompetitorEquipmentAttachmentDto],
    })
    CompetitorEQAttachment: CRMCompetitorEquipmentAttachmentDto[];

    static fromUberEquipment(equipment: Equipment): CRMCompetitorEquipmentDto {
        const dto = new CRMCompetitorEquipmentDto();
        dto.id = equipment.id;
        dto.brand = equipment.brand;
        dto.customerID = equipment.crmCustomerId;
        dto.horsePower = equipment.horsePower;
        dto.manufactureYear = String(equipment.yearOfManufacture);
        dto.model = equipment.model;
        dto.unitType = equipment.unitType;
        dto.serialNo = equipment.serialNumber;
        dto.remark = equipment.remark;
        dto.SP_ID = equipment.providerVendorId;
        dto.CompetitorEQAttachment = CRMCompetitorEquipmentAttachmentDto.fromAttachmentUrls(equipment.attachmentUrls);
        return dto;
    }
}
