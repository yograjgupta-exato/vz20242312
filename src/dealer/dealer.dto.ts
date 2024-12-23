import { ApiProperty } from '@nestjs/swagger';
import { Length, IsOptional } from 'class-validator';
import { Dealer } from './dealer.entity';

export class CreateDealerDto extends Dealer {
    @ApiProperty()
    @Length(5)
    password: string;
}

export class UpdateDealerDto extends Dealer {
    @IsOptional()
    @Length(5)
    password?: string;
}
