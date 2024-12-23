import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class TechnicalNoteDto {
    @ApiProperty({
        description: 'The unique identifier of a technical note.',
    })
    id: string;

    @ApiProperty({
        description: 'The image url of an Air-conditional unit.',
    })
    imageUrls: string[];

    @ApiProperty({
        description: 'The model of an Air-conditional unit.',
    })
    @IsNotEmpty()
    model: string;

    @ApiProperty({
        description: 'The friendly name of a technical note.',
    })
    name: string;

    @ApiProperty({
        description: 'The serial number of an Air-conditional unit.',
    })
    @IsNotEmpty()
    serialNumber: string;

    @ApiProperty({
        description: 'The service summary.',
    })
    serviceSummary: string;

    public constructor(id: string) {
        this.id = id;
        this.imageUrls = [];
        this.name = `Aircond ${id}`;
        this.model = '';
        this.serialNumber = '';
        this.serviceSummary = '';
    }
}
