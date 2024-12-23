import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsDecimal } from 'class-validator';
import { BaseModel } from '@shared/models/base.model';
import { IPay88ResponseStatus } from '../ipay88-response-status.enum';

export class BaseResponseModel extends BaseModel<BaseResponseModel> {
    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    MerchantCode: string;

    @IsNotEmpty()
    @IsDecimal()
    @ApiProperty()
    Amount: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    Currency: string;

    @IsNotEmpty()
    @IsEnum(IPay88ResponseStatus)
    @ApiProperty()
    Status: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    TransId?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    Signature?: string;
}
