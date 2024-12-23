import { Entity, DeepPartial, Column } from 'typeorm';
import { AbstractEntity } from '@shared/entities/abstract.entity';
import { Tenant } from '@shared/enums';
import { PaymentGatewayProviderType } from '@shared/enums/payment-gateway-provider-type';
import { PaymentGatewayResponseStatus } from '@shared/enums/payment-gateway-response-status';
import { PaymentPurposeCode } from '../../shared/enums/payment-purpose-code';

const PaymentMethods = {
    CreditCard: '2',
    Maybank2U: '6',
    AllianceOnline: '8',
    AmOnline: '10',
    RHBOnline: '14',
    HongLeongOnline: '15',
    CIMBClick: '20',
    WebCash: '22',
    PublicBankOnline: '31',
    PayPal: '48',
    CreditCardPreAuth: '55',
    BankRayatInternetBanking: '102',
    AffinOnline: '103',
    Pay4Me: '122',
    BSNOnline: '124',
    BankIslam: '134',
    UOB: '152',
    HongLeongPE: '163',
    BankMuamalat: '166',
    OCBC: '167',
    StandardCharteredBank: '168',
    CIMBVirtualAccount: '173',
    HSBCOnlineBanking: '198',
    KuwaitFinanceHouse: '199',
    Boost: '210',
    VCash: '243',
    GrabPay: '523',
    TouchNGo: '538',
};

const PaymentMethodNames = {
    [PaymentMethods.CreditCard]: 'Credit Card',
    [PaymentMethods.CreditCardPreAuth]: 'Credit Card (MYR) Pre-Auth',
    [PaymentMethods.Pay4Me]: 'Pay4Me',
    [PaymentMethods.HongLeongPE]: 'Hong Leong PEx+ (QR Payment)',
    [PaymentMethods.CIMBVirtualAccount]: 'CIMB Virtual',
    [PaymentMethods.PayPal]: 'PayPal',
    [PaymentMethods.Maybank2U]: 'FPX - Maybank',
    [PaymentMethods.AllianceOnline]: 'FPX - Alliance Bank',
    [PaymentMethods.AmOnline]: 'FPX - Ambank',
    [PaymentMethods.RHBOnline]: 'FPX - RHB Bank',
    [PaymentMethods.HongLeongOnline]: 'FPX - Hong Leong Bank',
    [PaymentMethods.CIMBClick]: 'FPX - CIMB Bank',
    [PaymentMethods.PublicBankOnline]: 'FPX - Public Bank',
    [PaymentMethods.BankRayatInternetBanking]: 'FPX - Bank Rakyat',
    [PaymentMethods.AffinOnline]: 'FPX - Affin Bank',
    [PaymentMethods.BSNOnline]: 'FPX - Bank Simpanan Nasional',
    [PaymentMethods.BankIslam]: 'FPX - Bank Islam',
    [PaymentMethods.UOB]: 'FPX - UOB',
    [PaymentMethods.OCBC]: 'FPX - OCBC Bank',
    [PaymentMethods.StandardCharteredBank]: 'FPX - Standard Chartered Bank',
    [PaymentMethods.HSBCOnlineBanking]: 'FPX - HSBC Bank',
    [PaymentMethods.KuwaitFinanceHouse]: 'FPX - Kuwait Finance House',
    [PaymentMethods.Boost]: 'eWallet - Boost',
    [PaymentMethods.GrabPay]: 'eWallet - GrabPay',
    [PaymentMethods.TouchNGo]: "eWallet - Touch 'n Go",
    [PaymentMethods.VCash]: 'eWallet - VCash',
};

@Entity({ name: 'payment_gateway_responses' })
export class PaymentGatewayResponse extends AbstractEntity {
    constructor(input?: DeepPartial<PaymentGatewayResponse>) {
        super(input);
    }

    @Column('simple-json', { nullable: true })
    data?: any;

    @Column({
        nullable: true,
    })
    errorDescription?: string;

    @Column({
        default: Tenant.Daikin,
        enum: Tenant,
        name: 'principal_group',
        type: 'enum',
    })
    principalGroup: Tenant;

    @Column({
        default: PaymentGatewayProviderType.IPAY88,
        enum: PaymentGatewayProviderType,
        type: 'enum',
    })
    provider: PaymentGatewayProviderType;

    @Column({ nullable: true })
    referenceId?: string;

    @Column({
        default: PaymentGatewayResponseStatus.FAILED,
        enum: PaymentGatewayResponseStatus,
        type: 'enum',
    })
    responseStatus: PaymentGatewayResponseStatus;

    // note(roy): perhaps should consider removing this unique constraint and allow multiple
    // payment responses from the same transactionId - it happens.
    @Column({ nullable: true, unique: true })
    transactionId?: string;

    @Column({ nullable: true })
    paymentId?: string;

    @Column({
        default: PaymentPurposeCode.FEE,
        enum: PaymentPurposeCode,
        type: 'enum',
        nullable: true,
    })
    paymentPurposeCode: PaymentPurposeCode;

    getPaymentMethod(): string {
        const paymentId = this.paymentId || this.data?.PaymentId;
        return paymentId ? PaymentMethodNames[paymentId] || '' : '';
    }

    getTransactionId(): string {
        return this.transactionId || this.data?.TransId;
    }
}
