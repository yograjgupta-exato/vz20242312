import { IsCurrency, IsDate, IsDefined, IsIn, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { Tenant } from '../../shared/enums';

export class PayoutSummaryFileHeaderDto {
    @IsDefined()
    @IsIn(['Service_id'])
    serviceRequestId = 'Service_id';

    @IsDefined()
    @IsIn(['Comp_no'])
    companyCode = 'Comp_no';

    @IsDefined()
    @IsIn(['Doc_date'])
    date = 'Doc_date';

    @IsDefined()
    @IsIn(['Head_text'])
    title = 'Head_text';

    @IsDefined()
    @IsIn(['Cost'])
    serviceProviderPayoutAmount = 'Cost';

    @IsDefined()
    @IsIn(['Sales'])
    customerPaidAmount = 'Sales';

    @IsDefined()
    @IsIn(['Promo_code'])
    consumerPromotionCode = 'Promo_code';

    @IsDefined()
    @IsIn(['Promo_code_amt'])
    consumerPromotionCodeAmount = 'Promo_code_amt';

    @IsDefined()
    @IsIn(['Surcharge_Vendor_ID'])
    serviceProviderVendorIdOnSurcharge = 'Surcharge_Vendor_ID';

    @IsDefined()
    @IsIn(['Service_Vendor_ID'])
    serviceProviderVendorIdOnServiceRequest = 'Service_Vendor_ID';
}

export const DMSS_COMPANY_CODE = '0700';
export const AMSS_COMPANY_CODE = '0800';

export class PayoutSummaryFileDetailDto {
    @IsDefined()
    @IsNotEmpty()
    @MaxLength(15)
    serviceRequestId: string = undefined;

    @IsDefined()
    @IsNotEmpty()
    @MaxLength(4)
    @IsIn([DMSS_COMPANY_CODE, AMSS_COMPANY_CODE])
    companyCode: string = undefined;

    // note(roy): dd/mm/yyyy
    @IsDefined()
    @IsNotEmpty()
    @IsDate()
    date: Date = undefined;

    @IsDefined()
    @IsNotEmpty()
    @MaxLength(25)
    title: string = undefined;

    @IsDefined()
    @IsNotEmpty()
    // eslint-disable-next-line @typescript-eslint/camelcase
    @IsCurrency({ require_symbol: false })
    serviceProviderPayoutAmount: string = undefined;

    @IsDefined()
    @IsNotEmpty()
    // eslint-disable-next-line @typescript-eslint/camelcase
    @IsCurrency({ require_symbol: false })
    customerPaidAmount: string = undefined;

    @IsDefined()
    @IsNotEmpty()
    @MaxLength(25)
    consumerPromotionCode = '';

    @IsDefined()
    @IsNotEmpty()
    // eslint-disable-next-line @typescript-eslint/camelcase
    @IsCurrency({ require_symbol: false })
    consumerPromotionAmount: string = undefined;

    @IsOptional()
    serviceProviderVendorIdOnSurcharge = '';

    @IsOptional()
    serviceProviderVendorIdOnServiceRequest = '';

    // note(roy): unlike amount (which uses string), why not date also use string?
    constructor(
        serviceRequestId: string,
        principalGroup: Tenant,
        title: string,
        serviceProviderPayoutAmount: number,
        customerPaidAmount: number,
        consumerPromotionCode = '',
        consumerPromotionAmount: number,
        serviceProviderVendorIdOnServiceRequest = '',
        serviceProviderVendorIdOnSurcharge = '',
        date = new Date(),
    ) {
        this.serviceRequestId = serviceRequestId;
        this.companyCode = principalGroup === Tenant.Daikin ? DMSS_COMPANY_CODE : AMSS_COMPANY_CODE;

        this.date = date;
        this.title = title;
        this.serviceProviderPayoutAmount = serviceProviderPayoutAmount.toFixed(2);
        this.customerPaidAmount = customerPaidAmount.toFixed(2);

        this.consumerPromotionCode = consumerPromotionCode || '';
        this.consumerPromotionAmount = (consumerPromotionAmount || 0).toFixed(2);

        this.serviceProviderVendorIdOnServiceRequest = serviceProviderVendorIdOnServiceRequest;
        this.serviceProviderVendorIdOnSurcharge = serviceProviderVendorIdOnSurcharge;
    }
}
