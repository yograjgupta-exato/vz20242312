import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDecimal, IsNotEmpty } from 'class-validator';
import { DigitalSignatureType } from '@shared/enums/digital-signature-type';
import { getSignature, stripAmountString } from '../ipay88.helper';
import { BaseResponseModel } from './base-response.model';
import { IResponseWithSignature } from './interfaces/response-with-signature.interface';

export class PaymentResponseModel extends BaseResponseModel implements IResponseWithSignature {
    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    AcquiringBank?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    ActionType?: string;

    @IsDecimal()
    Amount: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    AmountBeforeDiscount?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    AuthCode?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    BankMID?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    BindCardErrDescc?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    CCName?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    CCNo?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    CardCategory?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    CardType?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    DCCConversionRate?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    DCCStatus?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    Discount?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    ErrDesc?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    Lang?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    OriginalAmount?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    OriginalCurrency?: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    PaymentId: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    PaymentType?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    QRCode?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    QRValue?: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    RefNo: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    Remark?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    Requery?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    S_bankname?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    S_country?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    SettlementAmount?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    SettlementCurrency?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    TokenId?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    TranDate?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    Xfield1?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    Xfield2?: string;

    isSignatureValid(merchantKey: string): boolean {
        const expectedSignature = getSignature(
            [
                merchantKey,
                this.MerchantCode,
                this.PaymentId,
                this.RefNo,
                stripAmountString(this.Amount),
                this.Currency,
                this.Status,
            ],
            DigitalSignatureType.SHA256,
        );
        return expectedSignature === this.Signature;
    }
}
