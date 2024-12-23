import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNumberString, Length } from 'class-validator';

export class CustomerContactInput {
    @ApiProperty({
        description: 'The email of the customer.',
        example: 'cchitsiang@hotmail.com',
    })
    @IsEmail()
    @Transform(email => email.toLowerCase())
    email: string;

    @ApiProperty({
        description: 'The full name of the customer.',
        example: 'Chew Chit Siang',
    })
    @Length(4, 100)
    name: string;

    @ApiProperty({
        description: 'A unique phone number for the customer.',
        example: '+60167228527',
    })
    @IsNumberString()
    phone: string;

    @ApiProperty({
        description: 'A secondary unique phone number for the customer.',
        example: '+60167228527',
    })
    @IsNumberString()
    secondaryPhone?: string;
}
