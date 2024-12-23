import { IsCurrency, IsDefined, IsIn, IsNotEmpty, MaxLength } from 'class-validator';

export class PayoutLinesFileHeaderDto {
    @IsDefined()
    @IsIn(['Service_id'])
    serviceRequestId = 'Service_id';

    @IsDefined()
    @IsIn(['Job_no'])
    jobNo = 'Job_no';

    @IsDefined()
    @IsIn(['Job_desc'])
    jobDesc = 'Job_desc';

    @IsDefined()
    @IsIn(['Item_ref'])
    itemRef = 'Item_ref';

    @IsDefined()
    @IsIn(['Item_cost'])
    serviceProviderPayoutAmount = 'Item_cost';

    @IsDefined()
    @IsIn(['Item_single_unit_cost'])
    serviceProviderSingleUnitPayoutAmount = 'Item_single_unit_cost'; // before vol discount

    @IsDefined()
    @IsIn(['Item_price'])
    customerPaidAmount = 'Item_price';

    @IsDefined()
    @IsIn(['Item_single_unit_price'])
    customerSingleUnitPaidAmount = 'Item_single_unit_price'; // before vol discount

    @IsDefined()
    @IsIn(['Bank_acc'])
    serviceProviderBankAcc = 'Bank_acc';

    @IsDefined()
    @IsIn(['Bank_code'])
    serviceProviderBankCode = 'Bank_code';

    @IsDefined()
    @IsIn(['SAP_vendor'])
    serviceProviderSapVendorId = 'SAP_vendor';
}

export class PayoutLinesFileDetailDto {
    @IsDefined()
    @IsNotEmpty()
    @MaxLength(15)
    serviceRequestId: string = undefined;

    @IsDefined()
    @IsNotEmpty()
    @MaxLength(3)
    jobNo: string = undefined;

    @IsDefined()
    @IsNotEmpty()
    @MaxLength(50)
    jobDesc: string = undefined;

    @IsDefined()
    @IsNotEmpty()
    @MaxLength(50)
    itemRef: string = undefined;

    @IsDefined()
    @IsNotEmpty()
    // eslint-disable-next-line @typescript-eslint/camelcase
    @IsCurrency({ require_symbol: false })
    serviceProviderPayoutAmount: string = undefined;

    @IsDefined()
    @IsNotEmpty()
    // eslint-disable-next-line @typescript-eslint/camelcase
    @IsCurrency({ require_symbol: false })
    serviceProviderSingleUnitPayoutAmount: string = undefined;

    @IsDefined()
    @IsNotEmpty()
    // eslint-disable-next-line @typescript-eslint/camelcase
    @IsCurrency({ require_symbol: false })
    customerPaidAmount: string = undefined;

    @IsDefined()
    @IsNotEmpty()
    // eslint-disable-next-line @typescript-eslint/camelcase
    @IsCurrency({ require_symbol: false })
    customerSingleUnitPaidAmount: string = undefined;

    @IsDefined()
    @IsNotEmpty()
    @MaxLength(18)
    serviceProviderBankAcc: string = undefined;

    @IsDefined()
    @IsNotEmpty()
    @MaxLength(11)
    serviceProviderBankCode: string = undefined;

    @IsDefined()
    @IsNotEmpty()
    @MaxLength(10)
    serviceProviderSapVendorId: string = undefined;

    constructor(
        serviceRequestId: string,
        jobNo: string,
        jobDesc: string,
        itemRef: string,
        serviceProviderPayoutAmount: number,
        serviceProviderSingleUnitPayoutAmount: number,
        customerPaidAmount: number,
        customerSingleUnitPaidAmount: number,
        serviceProviderBankAcc: string,
        serviceProviderBankCode: string,
        serviceProviderSapVendorId: string,
    ) {
        this.serviceRequestId = serviceRequestId;
        this.jobNo = jobNo;
        this.jobDesc = jobDesc
            .substr(0, 50)
            .replace(/(?:\r\n|\r|\n)/g, ' ')
            .trim();

        this.itemRef = itemRef.substr(0, 50).trim();
        this.serviceProviderPayoutAmount = (serviceProviderPayoutAmount || 0).toFixed(2);
        this.serviceProviderSingleUnitPayoutAmount = (serviceProviderSingleUnitPayoutAmount || 0).toFixed(2);
        this.customerPaidAmount = (customerPaidAmount || 0).toFixed(2);
        this.customerSingleUnitPaidAmount = (customerSingleUnitPaidAmount || 0).toFixed(2);

        this.serviceProviderBankAcc = serviceProviderBankAcc;
        this.serviceProviderBankCode = serviceProviderBankCode;
        this.serviceProviderSapVendorId = serviceProviderSapVendorId;
    }
}
