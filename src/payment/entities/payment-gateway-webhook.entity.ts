import { Entity, DeepPartial, Column } from 'typeorm';
import { AbstractEntity } from '@shared/entities/abstract.entity';
import { Tenant } from '@shared/enums';
import { PaymentGatewayProviderType } from '@shared/enums/payment-gateway-provider-type';
import { PaymentGatewayResponseStatus } from '@shared/enums/payment-gateway-response-status';
import { PaymentPurposeCode } from '../../shared/enums/payment-purpose-code';

@Entity({ name: 'payment_gateway_webhooks' })
export class PaymentGatewayWebhook extends AbstractEntity {
    constructor(input?: DeepPartial<PaymentGatewayWebhook>) {
        super(input);
    }

    @Column('simple-json', { nullable: true })
    data: any;

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

    @Column({ nullable: true })
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
}
