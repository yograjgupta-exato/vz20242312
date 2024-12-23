import { OneToMany, Column } from 'typeorm';
import { CurrencyCode } from '@shared/enums';
import { ColumnNumericTransformer } from '@shared/typeorm/column-numeric-transformer';
import { CustomerOrderDto } from '@service-request/dto/customer-order.dto';
import { IRequestedServicePackage } from '@service-request/interfaces/requested-service-package.interface';
import { ApplyPromoCodeResult } from '../../promotion/promotion.dto';
import { RequestedServicePackage } from './requested-service-package.entity';

export class CustomerOrder {
    @Column({
        default: CurrencyCode.Myr,
        enum: CurrencyCode,
        name: '_currency',
        type: 'enum',
    })
    currency: CurrencyCode;

    @Column('decimal', {
        default: 0,
        name: '_consumer_discount_amount',
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    consumerDiscountAmount!: number;

    @Column('decimal', {
        default: 0,
        name: '_consumer_promotion_amount',
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    consumerPromotionAmount!: number;

    @Column({
        name: '_consumer_promotion_code',
        nullable: true,
    })
    consumerPromotionCode?: string;

    @Column('decimal', {
        default: 0,
        name: '_consumer_sub_total',
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    consumerSubTotal!: number;

    @Column('decimal', {
        default: 0,
        name: '_consumer_total',
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    consumerTotal!: number;

    @Column({
        name: '_remarks',
        nullable: true,
    })
    remarks?: string;

    @Column({ default: 0, name: '_service_types_entitlement' })
    serviceTypesEntitlement: number;

    @OneToMany(
        () => RequestedServicePackage,
        requestedServicePackage => requestedServicePackage.serviceRequest,
        { cascade: ['insert'], eager: true },
    )
    servicePackages!: IRequestedServicePackage[];

    @Column('decimal', {
        default: 0,
        name: '_service_provider_discount_amount',
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    serviceProviderDiscountAmount!: number;

    @Column('decimal', {
        default: 0,
        name: '_service_provider_sub_total',
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    serviceProviderSubTotal!: number;

    @Column('decimal', {
        name: '_service_provider_total',
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    serviceProviderTotal!: number;

    @Column({
        default: false,
        name: '_have_completed_all_technical_reports',
    })
    haveCompletedAllTechnicalReports: boolean;

    public constructor(remarks: string, requestedServicePackages: IRequestedServicePackage[], appliedPromotion: ApplyPromoCodeResult = null) {
        // handle hydration
        if (remarks === undefined || requestedServicePackages === undefined) {
            return;
        }
        this.remarks = remarks;
        this.servicePackages = this.bundleByServicePackageGroupCodes(requestedServicePackages);
        this.consumerDiscountAmount = this.calculateConsumerDiscountAmount();
        this.consumerSubTotal = this.calculateConsumerSubTotal();
        this.consumerTotal = this.calculateConsumerTotal();
        this.serviceProviderDiscountAmount = this.calculateServiceProviderDiscountAmount();
        this.serviceProviderSubTotal = this.calculateServiceProviderSubTotal();
        this.serviceProviderTotal = this.calculateServiceProviderTotal();
        this.serviceTypesEntitlement = this.calculateServiceTypesEntitlement();
        this.haveCompletedAllTechnicalReports = this.calculateTechnicalReportsCompletion();

        if (appliedPromotion && appliedPromotion.discountedAmount > 0) {
            this.consumerPromotionCode = appliedPromotion.code;
            this.consumerPromotionAmount = appliedPromotion.discountedAmount;
            this.consumerTotal -= appliedPromotion.discountedAmount;
        }
    }

    private bundleByServicePackageGroupCodes(requestedServicePackages: IRequestedServicePackage[]): IRequestedServicePackage[] {
        const groups = {};
        requestedServicePackages.forEach(rsp => {
            if (!groups[rsp.getServicePackageGroupCode()]) {
                groups[rsp.getServicePackageGroupCode()] = 0;
            }
            groups[rsp.getServicePackageGroupCode()] += rsp.getQuantity();
        });

        requestedServicePackages.forEach(rsp => rsp.changeServicePackageGroupQuantity(groups));
        return requestedServicePackages;
    }

    private calculateConsumerDiscountAmount(): number {
        return this.servicePackages.reduce((total, sp) => total + sp.getConsumerQuotationDiscountAmount(), 0);
    }

    private calculateConsumerTotal(): number {
        return this.servicePackages.reduce((total, sp) => total + sp.getConsumerQuotationTotal(), 0);
    }

    private calculateConsumerSubTotal(): number {
        return this.servicePackages.reduce((total, sp) => total + sp.getConsumerQuotationSubTotal(), 0);
    }

    private calculateServiceProviderDiscountAmount(): number {
        return this.servicePackages.reduce((total, sp) => total + sp.getServiceProviderQuotationDiscountAmount(), 0);
    }

    private calculateServiceProviderSubTotal(): number {
        return this.servicePackages.reduce((total, sp) => total + sp.getServiceProviderQuotationSubTotal(), 0);
    }

    private calculateServiceProviderTotal(): number {
        return this.servicePackages.reduce((total, sp) => total + sp.getServiceProviderQuotationTotal(), 0);
    }

    private calculateServiceTypesEntitlement(): number {
        // eslint-disable-next-line no-bitwise
        return this.servicePackages.reduce((entitlement, sp) => entitlement | sp.getServiceTypesEntitlement(), 0);
    }

    private calculateTechnicalReportsCompletion(): boolean {
        return this.servicePackages.every(sp => sp.hasTechnicalReportCompleted());
    }

    public totalServiceMinutes(): number {
        return this.servicePackages.reduce((total, sp) => total + sp.getTotalServiceMinutes(), 0);
    }

    public reviseRequestedServicePackages(servicePackages: IRequestedServicePackage[]): CustomerOrder {
        const appliedPromotion = new ApplyPromoCodeResult();
        appliedPromotion.code = this.consumerPromotionCode;
        appliedPromotion.discountedAmount = this.consumerPromotionAmount;
        return new CustomerOrder(this.remarks, servicePackages, appliedPromotion);
    }

    applyPromotion(appliedPromotion: ApplyPromoCodeResult) {
        return new CustomerOrder(this.remarks, this.servicePackages, appliedPromotion);
    }

    public reset(): CustomerOrder {
        return this.reviseRequestedServicePackages(this.servicePackages);
    }

    public toDto(): CustomerOrderDto {
        const dto = new CustomerOrderDto();
        dto.consumerDiscountAmount = this.consumerDiscountAmount;
        if (this.consumerPromotionCode) {
            dto.consumerPromotionCode = this.consumerPromotionCode;
            dto.consumerPromotionAmount = this.consumerPromotionAmount;
        } else {
            dto.consumerPromotionCode = null;
            dto.consumerPromotionAmount = 0;
        }
        dto.consumerSubTotal = this.consumerSubTotal;
        dto.consumerTotal = this.consumerTotal;
        dto.remarks = this.remarks;
        dto.serviceProviderDiscountAmount = this.serviceProviderDiscountAmount;
        dto.serviceProviderSubTotal = this.serviceProviderSubTotal;
        dto.serviceProviderTotal = this.serviceProviderTotal;

        if (this.servicePackages) {
            dto.servicePackages = this.servicePackages.map(sp => sp.toDto());
        }
        return dto;
    }
}
