import { IsCurrency, IsDate, IsDefined, IsEmail, IsIn, IsNotEmpty, IsNumber, IsNumberString, IsOptional, MaxLength } from 'class-validator';

export class ScbPaymentHeaderDto {
    @IsDefined()
    @IsIn(['H'])
    recordType: string = undefined;

    @IsDefined()
    @IsIn(['P'])
    fileType: string = undefined;

    constructor() {
        this.recordType = 'H';
        this.fileType = 'P';
    }
}

export class ScbPaymentDetailDto {
    @IsDefined()
    @IsIn(['P'])
    recordType: string = undefined;

    @IsDefined()
    @IsIn(['ACH'])
    paymentType: string = undefined; // ACH=GIRO (<MYR1Mil)

    @IsDefined()
    @IsIn(['BA'])
    processingMode: string = undefined;

    @IsOptional()
    serviceType?: string = undefined;

    @IsDefined()
    @IsNotEmpty()
    customerReference: string = undefined;

    @IsOptional()
    customerMemo?: string = undefined;

    @IsDefined()
    @IsIn(['MY'])
    debitAcCountryCode: string = undefined;

    @IsDefined()
    @IsNotEmpty()
    debitAcCityCode: string = undefined;

    @IsDefined()
    @IsNotEmpty()
    debitAcNo: string = undefined;

    @IsDefined()
    @IsDate()
    paymentDate: Date = undefined;

    @IsDefined()
    @IsNotEmpty()
    @MaxLength(96)
    payeeNameInBO: string = undefined;

    // note(roy): should i follow what the specs says -
    // this address field is an extension of payeeNameInBO that exceeds 35 chars?
    @IsDefined()
    @IsNotEmpty()
    @MaxLength(35)
    payeeAddress1InBO: string = undefined;

    @IsOptional()
    @MaxLength(35)
    payeeAddress2InBO?: string = undefined;

    @IsOptional()
    @IsIn(['MY'])
    payeeCountryCode: string = undefined;

    @IsOptional()
    payeeFaxNumber?: string = undefined;

    @IsDefined()
    @IsNotEmpty()
    payeeBankCode: string = undefined;

    @IsOptional()
    payeeBankLocalClearingCode?: string = undefined;
    @IsOptional()
    payeeBranchCode?: string = undefined;
    @IsOptional()
    payeeBranchSubCode?: string = undefined;

    @IsDefined()
    @IsNotEmpty()
    beneficiaryAcNo: string = undefined;

    @IsOptional()
    paymentDetails1InBO?: string = undefined;
    @IsOptional()
    paymentDetails2InBO?: string = undefined;

    @IsCurrency()
    @IsOptional()
    vatAmount?: string = undefined;

    @IsOptional()
    wHTPrintingLocation?: string = undefined;
    @IsOptional()
    wHTFormId?: string = undefined;
    @IsOptional()
    wHTTaxId?: string = undefined;
    @IsOptional()
    wHTReferenceNumber?: string = undefined;
    @IsOptional()
    wHTType1?: string = undefined;
    @IsOptional()
    wHTDescription1?: string = undefined;

    @IsCurrency()
    @IsOptional()
    wHTGrossAmount1?: string = undefined;

    @IsCurrency()
    @IsOptional()
    wHTAmount1?: string = undefined;

    @IsOptional()
    wHTType2?: string = undefined;

    @IsOptional()
    wHTDescription2?: string = undefined;

    @IsCurrency()
    @IsOptional()
    wHTGrossAmount2?: string = undefined;

    @IsCurrency()
    @IsOptional()
    wHTAmount2?: string = undefined;

    @IsCurrency()
    @IsOptional()
    discountAmount?: string = undefined;

    @IsDefined()
    @IsNotEmpty()
    @IsIn(['4'])
    @IsNumberString()
    invoiceFormat: string = undefined;

    @IsDefined()
    @IsNotEmpty()
    @IsIn(['MYR'])
    paymentCurrency: string = undefined;

    @IsDefined()
    // eslint-disable-next-line @typescript-eslint/camelcase
    @IsCurrency({ require_symbol: false })
    invoiceOrGrossAmount: string = undefined;

    @IsOptional()
    localChargesTo?: string = undefined;
    @IsOptional()
    overseasChargesTo?: string = undefined;

    @IsOptional()
    intermediaryBankCode?: string = undefined;

    @IsOptional()
    clearingCodeForTT?: string = undefined;

    @IsOptional()
    clearingZoneCodeForLBC?: string = undefined;

    @IsOptional()
    draweeBankCodeForIBC?: string = undefined;

    // note(roy): in excel spec, its mandatory, however in sample its not.
    @IsOptional()
    deliveryMethod?: number = undefined;

    // note(roy): in excel spec, its mandatory, however in sample its not.
    @IsOptional()
    deliverTo?: number = undefined;

    @IsOptional()
    counterPickupLocation?: string = undefined;
    fXType?: string = undefined;

    @IsOptional()
    @MaxLength(40)
    payeeNameLine1LocalLanguage?: string = undefined;

    @IsOptional()
    @MaxLength(40)
    payeeNameLine2LocalLanguage?: string = undefined;

    @IsOptional()
    @MaxLength(40)
    payeeAddress1LocalLanguage?: string = undefined;

    @IsOptional()
    @MaxLength(40)
    payeeAddress2LocalLanguage?: string = undefined;

    @IsOptional()
    @MaxLength(40)
    payeeAddress3LocalLanguage?: string = undefined;

    @IsOptional()
    @MaxLength(40)
    payeeAddress4LocalLanguage?: string = undefined;

    @IsOptional()
    paymentDetail1LocalLanguage?: string = undefined;
    @IsOptional()
    paymentDetail2LocalLanguage?: string = undefined;
    @IsOptional()
    vatType?: string = undefined;
    @IsOptional()
    discountType?: string = undefined;
    @IsOptional()
    debitCurrency?: string = undefined;
    @IsOptional()
    debitBankId?: string = undefined;
    @IsOptional()
    payeeId?: string = undefined;
    @IsOptional()
    @IsEmail()
    emailId?: string = undefined;

    // note(roy): there is a conflict in spec, partly says its mandatory, another half says its NA.
    // from `payeeOrBeneficiaryType` till `receiverCorrespondingBankCode`
    @IsOptional()
    payeeOrBeneficiaryType?: string = undefined;
    @IsOptional()
    beneficiaryBankType?: string = undefined;
    @IsOptional()
    beneficiaryBankName?: string = undefined;
    @IsOptional()
    beneficiaryBankAddr?: string = undefined;
    @IsOptional()
    intermediaryBankType?: string = undefined;
    @IsOptional()
    intermediaryBankName?: string = undefined;
    @IsOptional()
    intermediaryBankAddr?: string = undefined;
    @IsOptional()
    receiverCorrespondingBankCode?: string = undefined;

    @IsOptional()
    orderingCustomer?: string = undefined;
    @IsOptional()
    relatedInformation?: string = undefined;
    @IsOptional()
    specialInstructionCode1?: string = undefined;
    @IsOptional()
    specialInstructionDetail1?: string = undefined;
    @IsOptional()
    specialInstructionCode2?: string = undefined;
    @IsOptional()
    specialInstructionDetail2?: string = undefined;
    @IsOptional()
    specialInstructionCode3?: string = undefined;
    @IsOptional()
    specialInstructionDetail3?: string = undefined;
    @IsOptional()
    specialInstructionCode4?: string = undefined;
    @IsOptional()
    specialInstructionDetail4?: string = undefined;
    @IsOptional()
    specialInstructionCode5?: string = undefined;
    @IsOptional()
    specialInstructionDetail5?: string = undefined;
    @IsOptional()
    specialInstructionCode6?: string = undefined;
    @IsOptional()
    specialInstructionDetail6?: string = undefined;
    @IsOptional()
    remittanceInformationCode1?: string = undefined;
    @IsOptional()
    remittanceInformationDetail1?: string = undefined;
    @IsOptional()
    remittanceInformationCode2?: string = undefined;
    @IsOptional()
    remittanceInformationDetail2?: string = undefined;
    @IsOptional()
    remittanceInformationCode3?: string = undefined;
    @IsOptional()
    remittanceInformationDetail3?: string = undefined;
    @IsOptional()
    remittanceInformationCode4?: string = undefined;
    @IsOptional()
    remittanceInformationDetail4?: string = undefined;
    @IsOptional()
    instructionCode1?: string = undefined;
    @IsOptional()
    instructionCodeDesc1?: string = undefined;
    @IsOptional()
    instructionCode2?: string = undefined;
    @IsOptional()
    instructionCodeDesc2?: string = undefined;
    @IsOptional()
    instructionCode3?: string = undefined;
    @IsOptional()
    instructionCodeDesc3?: string = undefined;
    @IsOptional()
    instructionCode4?: string = undefined;
    @IsOptional()
    instructionCodeDesc4?: string = undefined;
    @IsOptional()
    instructionCode5?: string = undefined;
    @IsOptional()
    instructionCodeDesc5?: string = undefined;
    @IsOptional()
    instructionCode6?: string = undefined;
    @IsOptional()
    instructionCodeDesc6?: string = undefined;
    @IsOptional()
    regulatoryReportingCode1?: string = undefined;
    @IsOptional()
    regulatoryReportingDesc1?: string = undefined;
    @IsOptional()
    regulatoryReportingCode2?: string = undefined;
    @IsOptional()
    regulatoryReportingDesc2?: string = undefined;
    @IsOptional()
    regulatoryReportingCode3?: string = undefined;
    @IsOptional()
    regulatoryReportingDesc3?: string = undefined;
    @IsOptional()
    senderCharges?: string = undefined;
    @IsOptional()
    receiverCharges?: string = undefined;
    @IsOptional()
    chequeNo?: string = undefined;
    @IsOptional()
    @IsDate()
    chequeIssuedDate?: Date = undefined;
    @IsOptional()
    corporateChequeNo?: string = undefined;
    @IsOptional()
    externalMemo?: string = undefined;
    @IsOptional()
    mailingAddress1?: string = undefined;
    @IsOptional()
    mailingAddress2?: string = undefined;
    @IsOptional()
    mailingAddress3?: string = undefined;
    @IsOptional()
    mailingAddress4?: string = undefined;
    @IsOptional()
    transactionCode?: string = undefined;
    @IsOptional()
    customInvoiceHeader1?: string = undefined;
    @IsOptional()
    customInvoiceColumnAlignment1?: string = undefined;
    @IsOptional()
    customInvoiceColumnLength1?: string = undefined;
    @IsOptional()
    customInvoiceHeader2?: string = undefined;
    @IsOptional()
    customInvoiceColumnAlignment2?: string = undefined;
    @IsOptional()
    customInvoiceColumnLength2?: string = undefined;
    @IsOptional()
    customInvoiceHeader3?: string = undefined;
    @IsOptional()
    customInvoiceColumnAlignment3?: string = undefined;
    @IsOptional()
    customInvoiceColumnLength3?: string = undefined;
    @IsOptional()
    customInvoiceHeader4?: string = undefined;
    @IsOptional()
    customInvoiceColumnAlignment4?: string = undefined;
    @IsOptional()
    customInvoiceColumnLength4?: string = undefined;
    @IsOptional()
    customInvoiceHeader5?: string = undefined;
    @IsOptional()
    customInvoiceColumnAlignment5?: string = undefined;
    @IsOptional()
    customInvoiceColumnLength5?: string = undefined;
    @IsOptional()
    customInvoiceHeader6?: string = undefined;
    @IsOptional()
    customInvoiceColumnAlignment6?: string = undefined;
    @IsOptional()
    customInvoiceColumnLength6?: string = undefined;
    @IsOptional()
    customInvoiceHeader7?: string = undefined;
    @IsOptional()
    customInvoiceColumnAlignment7?: string = undefined;
    @IsOptional()
    customInvoiceColumnLength7?: string = undefined;
    @IsOptional()
    customInvoiceHeader8?: string = undefined;
    @IsOptional()
    customInvoiceColumnAlignment8?: string = undefined;
    @IsOptional()
    customInvoiceColumnLength8?: string = undefined;
    @IsOptional()
    customInvoiceHeader9?: string = undefined;
    @IsOptional()
    customInvoiceColumnAlignment9?: string = undefined;
    @IsOptional()
    customInvoiceColumnLength9?: string = undefined;
    @IsOptional()
    fxRateIndicator?: string = undefined;
    @IsOptional()
    destinationCenterCountryCode?: string = undefined;
    @IsOptional()
    destinationCenterCityCode?: string = undefined;
    @IsOptional()
    datePriority?: string = undefined;
    @IsOptional()
    amountPriority?: string = undefined;
    @IsOptional()
    onBehalfOfName?: string = undefined;
    @IsOptional()
    onBehalfOfAccount?: string = undefined;
    @IsOptional()
    onBehalfOfAddress1?: string = undefined;
    @IsOptional()
    onBehalfOfAddress2?: string = undefined;
    @IsOptional()
    onBehalfOfAddress3?: string = undefined;
    @IsOptional()
    onBehalfOfNameLocalLanguage?: string = undefined;
    @IsOptional()
    onBehalfOfAddress1LocalLanguage?: string = undefined;
    @IsOptional()
    onBehalfOfAddress2LocalLanguage?: string = undefined;
    @IsOptional()
    onBehalfOfAddress3LocalLanguage?: string = undefined;
    @IsOptional()
    fxRateType?: string = undefined;
    @IsOptional()
    deliveryOption?: string = undefined;

    // note(roy): should we select WORKERS' REMITTANCES?
    @IsDefined()
    @IsNotEmpty()
    purposeOfPaymentTransactionId: string = undefined;

    @IsOptional()
    receiverIdBillerCodeOrBeneficiaryIdRTGS?: string = undefined;
    @IsOptional()
    receiverIdType?: string = undefined;
    @IsOptional()
    newICOrOldICOrCompRegOrPassportPoliceNoAkaCustomerNo?: string = undefined;
    @IsOptional()
    validationTypeAkaListedCompanyCode?: string = undefined;
    @IsOptional()
    byOrderOfSelf?: string = undefined;
    @IsOptional()
    paySubProductType?: string = undefined;
    @IsOptional()
    beneficiaryAccountType?: string = undefined;
    @IsOptional()
    oBOId?: string = undefined;
    @IsOptional()
    cASPaymentIndicator?: string = undefined;
    @IsOptional()
    onBehalfOfType?: string = undefined;
    @IsOptional()
    onBehalfOfPartyIdentifierCode?: string = undefined;
    @IsOptional()
    onBehalfOfPartyIdentifierCountryCode?: string = undefined;
    @IsOptional()
    onBehalfOfPartyIdentifierIssuer?: string = undefined;
    @IsOptional()
    onBehalfOfPartyIdentifierIssuingAuthority?: string = undefined;
    @IsOptional()
    onBehalfOfPartyIdentifierRegistrationAuthority?: string = undefined;
    @IsOptional()
    partyIdentifierValueOrAccountNumber?: string = undefined;
    @IsOptional()
    onBehalfOfAddress1Code?: string = undefined;
    @IsOptional()
    onBehalfOfAddress1CountryCode?: string = undefined;
    @IsOptional()
    onBehalfOfAddress2Code?: string = undefined;
    @IsOptional()
    onBehalfOfAddress2CountryCode?: string = undefined;
    @IsOptional()
    onBehalfOfAddress3Code?: string = undefined;
    @IsOptional()
    onBehalfOfAddress3CountryCode?: string = undefined;
    @IsOptional()
    onBehalfOfAddressLineIssuer?: string = undefined;
    @IsOptional()
    onBehalfOfAddressLineIssuerLL?: string = undefined;
    @IsOptional()
    filler1?: string = undefined;
    @IsOptional()
    destinationPurposeCode?: string = undefined;
    @IsOptional()
    filler2?: string = undefined;
    @IsOptional()
    filler3?: string = undefined;
    @IsOptional()
    filler4?: string = undefined;
    @IsOptional()
    filler5?: string = undefined;
    @IsOptional()
    filler6?: string = undefined;
    @IsOptional()
    filler7?: string = undefined;
    @IsOptional()
    filler8?: string = undefined;
    @IsOptional()
    filler9?: string = undefined;
    @IsOptional()
    filler10?: string = undefined;
    @IsOptional()
    recipientReferenceNumber1?: string = undefined;
    @IsOptional()
    recipientReferenceNumber2?: string = undefined;
    @IsOptional()
    filler11?: string = undefined;
    @IsOptional()
    jointBeneficiaryNameSecondAccountHolderName?: string = undefined;
    @IsOptional()
    jointBeneficiaryId?: string = undefined;
    @IsOptional()
    jointBeneficiaryIdType?: string = undefined;

    // refactor(roy): into builder's pattern to eliminate telescopic constructor
    constructor(
        customerReference: string,
        payerAccountNo: string,
        payerCityCode: string,
        paymentDate: Date,
        payeeName: string,
        payeeAddress: string,
        payeeBankCode: string,
        payeeAccountNo: string,
        paymentAmount: number,
        payeeEmail?: string,
    ) {
        this.customerReference = customerReference;

        // payer
        this.debitAcNo = payerAccountNo;
        this.debitAcCityCode = payerCityCode;

        this.paymentDate = paymentDate;

        // payee
        this.payeeNameInBO = payeeName;
        this.payeeAddress1InBO = payeeAddress.slice(0, 35);
        this.payeeAddress2InBO = payeeAddress.slice(35, 70);

        this.payeeBankCode = payeeBankCode;
        this.beneficiaryAcNo = payeeAccountNo;

        this.invoiceOrGrossAmount = paymentAmount.toFixed(2);
        this.emailId = payeeEmail;

        // note(roy): hardcoded from given spec
        this.recordType = 'P';
        this.paymentType = 'ACH';
        this.processingMode = 'BA';
        this.purposeOfPaymentTransactionId = '21220';
        this.paymentCurrency = 'MYR';
        this.invoiceFormat = '4';
        this.payeeCountryCode = 'MY';
        this.debitAcCountryCode = 'MY';
    }
}

export class ScbPaymentInvoiceDto {
    @IsDefined()
    @IsIn(['I'])
    recordType: string = undefined;

    @IsDefined()
    @IsNotEmpty()
    invoiceReference: string = undefined;

    @IsDefined()
    @IsDate()
    invoiceDate: Date = undefined;

    @IsDefined()
    @IsNotEmpty()
    invoiceDescription: string = undefined;

    @IsDefined()
    // eslint-disable-next-line @typescript-eslint/camelcase
    @IsCurrency({ require_symbol: false })
    invoiceAmount: string = undefined;

    constructor(invoiceReference: string, invoiceDate: Date, invoiceDescription: string, invoiceAmount: number) {
        this.recordType = 'I';
        this.invoiceReference = invoiceReference;
        this.invoiceDate = invoiceDate;
        this.invoiceDescription = invoiceDescription;
        this.invoiceAmount = invoiceAmount?.toFixed(2);
    }
}

export class ScbPaymentTrailerDto {
    @IsDefined()
    @IsIn(['T'])
    recordType: string = undefined;

    @IsDefined()
    @IsNumber()
    @IsNotEmpty()
    totalNumberOfRecords = 0;

    @IsDefined()
    // eslint-disable-next-line @typescript-eslint/camelcase
    @IsCurrency({ require_symbol: false })
    totalInvoiceAmount: string = undefined;

    constructor(totalNumberOfRecords: number, totalPaymentAmount: number) {
        this.recordType = 'T';
        this.totalNumberOfRecords = totalNumberOfRecords;
        this.totalInvoiceAmount = totalPaymentAmount.toFixed(2);
    }
}
