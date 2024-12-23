import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, Length, IsNumberString } from 'class-validator';
import { Column } from 'typeorm';

export class CustomerContact {
    @ApiProperty({
        description: 'The email of the customer.',
    })
    @Column({
        comment: 'The email of the customer.',
        name: '_email',
    })
    @IsEmail()
    @Transform(email => email.toLowerCase())
    email: string;

    @ApiProperty({
        description: 'The full name of the customer.',
    })
    @Column({
        comment: 'The full name of the customer.',
        name: '_name',
    })
    @Length(4, 100)
    name: string;

    @ApiProperty({
        description: 'A unique phone number for the customer.',
    })
    @IsNumberString()
    @Column({
        comment: 'A unique phone number for the customer.',
        name: '_phone',
    })
    phone: string;

    @ApiProperty({
        description: 'A secondary unique phone number for the customer.',
    })
    @IsNumberString()
    @Column({
        comment: 'A secondary unique phone number for the customer.',
        name: '_secondary_phone',
        nullable: true,
    })
    secondaryPhone?: string;
}
