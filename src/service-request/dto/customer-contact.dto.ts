import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Length, IsNumberString } from 'class-validator';

export class CustomerContactDto {
    @ApiProperty({
        description: 'The email of the customer.',
    })
    @Transform(email => email.toLowerCase())
    email: string;

    @ApiProperty({
        description: 'The full name of the customer.',
    })
    @Length(4, 100)
    name: string;

    @ApiProperty({
        description: 'A unique phone number for the customer.',
    })
    @IsNumberString()
    phone: string;

    @ApiProperty({
        description: 'A secondary unique phone number for the customer.',
    })
    @IsNumberString()
    secondaryPhone?: string;
}
