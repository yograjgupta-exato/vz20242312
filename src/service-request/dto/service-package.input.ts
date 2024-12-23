import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ServicePackageInput {
    @ApiProperty({
        description: 'The ID of the service package.'
    })
    @IsUUID()
    id!: string;

    @ApiProperty({
        description: 'The number of items requested in the service package.'
    })
    quantity!: number;
}