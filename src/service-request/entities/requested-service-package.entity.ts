import { Logger } from '@nestjs/common';
import { IsUUID } from 'class-validator';
import { Entity, ManyToOne, PrimaryColumn, Column } from 'typeorm';
import { UserInputError } from '@shared/errors';
import { ColumnNumericTransformer } from '@shared/typeorm/column-numeric-transformer';
import { RequestedServicePackageDto } from '@service-request/dto/requested-service-package.dto';
import { IRequestedServicePackage } from '@service-request/interfaces/requested-service-package.interface';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { ServicePackage } from '@service-package/entities/service-package.entity';
import { ConsumerQuotation } from '../../service-package/entities/consumer-quotation.entity';
import { ServiceProviderQuotation } from '../../service-package/entities/service-provider-quotation.entity';
import { TechnicalNoteDto } from '../dto/technical-note.dto';
import { ServiceRequest } from './service-request.entity';
import { TechnicalReport } from './technical-report.entity';
import { IServicePackage } from 'service-package/entities/interfaces/service-package.interface';

@Entity({ name: 'requested_service_packages' })
export class RequestedServicePackage implements IRequestedServicePackage {
    @Column()
    name: string;

    @Column({ nullable: true })
    description?: string;

    @Column('simple-json', { nullable: true })
    consumerQuotations: ConsumerQuotation[];

    @Column('simple-json', { nullable: true })
    serviceProviderQuotations: ServiceProviderQuotation[];

    @Column({ nullable: true })
    noteToServiceProvider?: string;

    @Column('decimal', {
        default: 9,
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    consumerQuotationDiscountedUnitPrice!: number;

    @Column()
    consumerQuotationMinQuantity!: number;

    @Column('decimal', {
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    consumerQuotationSubTotal: number;

    @Column('decimal', {
        default: 0,
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    consumerQuotationTotal: number;

    @Column('decimal', {
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    consumerQuotationUnitPrice!: number;

    @Column('decimal', {
        default: 0,
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    consumerQuotationDiscountAmount: number;

    @Column()
    quantity!: number;

    @Column({ default: 0 })
    serviceTypesEntitlement: number;

    @Column('decimal', {
        default: 9,
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    serviceProviderQuotationDiscountedUnitPrice!: number;

    @Column()
    serviceProviderQuotationMinQuantity!: number;

    @Column('decimal', {
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    serviceProviderQuotationSubTotal: number;

    @Column('decimal', {
        default: 0,
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    serviceProviderQuotationTotal: number;

    @Column('decimal', {
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    serviceProviderQuotationUnitPrice!: number;

    @Column('decimal', {
        default: 0,
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    serviceProviderQuotationDiscountAmount: number;

    @Column()
    serviceProviderQuotationState!: string;

    @ManyToOne(() => ServicePackage, { primary: true, eager: true })
    servicePackage!: IServicePackage;

    @IsUUID()
    @PrimaryColumn()
    servicePackageId!: string;

    @Column()
    servicePackageGroupCode: string;

    @Column()
    servicePackageGroupQuantity: number;

    @ManyToOne(
        () => ServiceRequest,
        serviceRequest => serviceRequest.customerOrder.servicePackages,
        { primary: true },
    )
    serviceRequest!: IServiceRequest;

    @IsUUID()
    @PrimaryColumn()
    serviceRequestId!: string;

    @Column(() => TechnicalReport)
    technicalReport: TechnicalReport;

    @Column()
    totalServiceMinutes: number;

    @Column()
    unitServiceMinutes: number;

    private readonly logger = new Logger(RequestedServicePackage.name);

    public constructor(quantity: number, customerAddressState: string, servicePackage: IServicePackage) {
        // note(roy): skip typeorm hydration
        if (quantity === undefined || servicePackage === undefined) {
            return;
        }

        if (!customerAddressState.trim()) {
            throw new UserInputError("customer address state can't be null", { customerAddressState });
        }

        if (!servicePackage) {
            throw new UserInputError("service package can't be null", { servicePackage: 'null' });
        }

        this.consumerQuotations = servicePackage.getConsumerQuotations();
        this.serviceProviderQuotations = servicePackage.getServiceProviderQuotations();

        this.serviceProviderQuotationState = customerAddressState;
        this.reviseFromNewQuotations(servicePackage, quantity);
    }

    private changeServicePackage(servicePackage: IServicePackage) {
        this.servicePackage = servicePackage;
        this.servicePackageGroupCode = servicePackage.getServicePackageGroupCode();
        this.unitServiceMinutes = servicePackage.getUnitServiceMinutes();
        this.description = servicePackage.getDescription();
        this.name = servicePackage.getName();
        this.noteToServiceProvider = servicePackage.getNoteToServiceProvider();
        this.serviceTypesEntitlement = servicePackage.getServiceTypesEntitlement();
        const originalQuantity = 1;
        this.reflectConsumerOriginalQuotations(originalQuantity);
        this.reflectServiceProviderOriginalQuotations(originalQuantity, this.serviceProviderQuotationState);
    }

    // note(roy): so far app do not have such use-cases,
    // it only used in patching pricing discrepancy now.
    public reviseFromNewQuotations(servicePackage: IServicePackage, quantity: number) {
        this.changeServicePackage(servicePackage);
        this.changeQuantity(quantity);
    }

    public changeQuantity(quantity: number) {
        this.quantity = quantity;

        this.technicalReport = this.technicalReport?.numOfNotes() !== this.quantity ? this.generateTechnicalReport(quantity) : this.technicalReport;

        this.totalServiceMinutes = this.calculateTotalServiceMinutes(quantity);
        this.reflectConsumerDiscountedQuotations(quantity);
        this.calculateConsumerTotals(quantity);

        this.reflectServiceProviderDiscountedQuotations(quantity, this.serviceProviderQuotationState);
        this.calculateServiceProviderTotals(quantity);
    }

    public changeServicePackageGroupQuantity(servicePackageGroupsQuantity: { [servicePackageGroupCode: string]: number }) {
        if (!this.servicePackageGroupCode || !servicePackageGroupsQuantity[this.servicePackageGroupCode]) {
            return (this.servicePackageGroupQuantity = 0);
        }

        const groupQuantity = servicePackageGroupsQuantity[this.servicePackageGroupCode];
        this.servicePackageGroupQuantity = groupQuantity < 0 ? 0 : groupQuantity;

        this.reflectConsumerDiscountedQuotations(this.servicePackageGroupQuantity);
        this.calculateConsumerTotals(this.quantity);

        this.reflectServiceProviderDiscountedQuotations(this.servicePackageGroupQuantity, this.serviceProviderQuotationState);
        this.calculateServiceProviderTotals(this.quantity);
    }

    // note(roy): Skip and return if `consumerQuotations` is non-existent. This is to prevent
    // any sorts of recalculation from service package's quotation, for legacy data in db
    // prior quotation snapshot.
    //
    // Prior to this, quotations were not snapshot from service packages, but rather, it got
    // re-query every time from service package whenever there is a recalculation.
    //
    // This potentially causing in-accurate pricing reflection as the service package pricing might got
    // updated after customer already made payment.
    private reflectConsumerDiscountedQuotations(quantity: number) {
        if (!this.consumerQuotations) {
            return;
        }

        const discountedQuotation = this.lowestConsumerQuotationTierBasedOnQuantity(quantity);
        this.consumerQuotationMinQuantity = discountedQuotation?.minQuantity ?? 0;
        this.consumerQuotationDiscountedUnitPrice = discountedQuotation?.unitPrice ?? 0;
    }

    // note(roy): Skip and return if `serviceProviderQuotations` is non-existent. This is to prevent
    // any sorts of recalculation from service package's quotation, for legacy data in db
    // prior quotation snapshot.
    //
    // Prior to this, quotations were not snapshot from service packages, but rather, it got
    // re-query every time from service package whenever there is a recalculation.
    //
    // This potentially causing in-accurate pricing reflection as the service package pricing might got
    // updated after customer already made payment.
    private reflectServiceProviderDiscountedQuotations(quantity: number, customerAddressState: string) {
        if (!this.serviceProviderQuotations) {
            return;
        }

        const discountedQuotation = this.lowestServiceProviderQuotationTierBasedOnQuantity(quantity, customerAddressState);
        this.serviceProviderQuotationMinQuantity = discountedQuotation?.minQuantity ?? 0;
        this.serviceProviderQuotationDiscountedUnitPrice = discountedQuotation?.unitPrice ?? 0;
    }

    // note(roy): Skip and return if `consumerQuotations` is non-existent. This is to prevent
    // any sorts of recalculation from service package's quotation, for legacy data in db
    // prior quotation snapshot.
    //
    // Prior to this, quotations were not snapshot from service packages, but rather, it got
    // re-query every time from service package whenever there is a recalculation.
    //
    // This potentially causing in-accurate pricing reflection as the service package pricing might got
    // updated after customer already made payment.
    private reflectConsumerOriginalQuotations(quantity: number) {
        if (!this.consumerQuotations) {
            return;
        }

        const originalQuotation = this.lowestConsumerQuotationTierBasedOnQuantity(quantity);
        this.consumerQuotationUnitPrice = originalQuotation?.unitPrice || 0;
    }

    // note(roy): Skip and return if `serviceProviderQuotations` is non-existent. This is to prevent
    // any sorts of recalculation from service package's quotation, for legacy data in db
    // prior quotation snapshot.
    //
    // Prior to this, quotations were not snapshot from service packages, but rather, it got
    // re-query every time from service package whenever there is a recalculation.
    //
    // This potentially causing in-accurate pricing reflection as the service package pricing might got
    // updated after customer already made payment.
    private reflectServiceProviderOriginalQuotations(quantity: number, customerAddressState: string) {
        if (!this.serviceProviderQuotations) {
            return;
        }

        const originalQuotation = this.lowestServiceProviderQuotationTierBasedOnQuantity(quantity, customerAddressState);
        this.serviceProviderQuotationUnitPrice = originalQuotation?.unitPrice || 0;
        this.serviceProviderQuotationState = originalQuotation?.state || '';
    }

    private calculateConsumerTotals(quantity: number) {
        this.consumerQuotationSubTotal = quantity * this.consumerQuotationUnitPrice;
        this.consumerQuotationTotal = quantity * this.consumerQuotationDiscountedUnitPrice;
        this.consumerQuotationDiscountAmount = this.consumerQuotationSubTotal - this.consumerQuotationTotal;
    }

    private calculateServiceProviderTotals(quantity: number) {
        this.serviceProviderQuotationSubTotal = quantity * this.serviceProviderQuotationUnitPrice;
        this.serviceProviderQuotationTotal = quantity * this.serviceProviderQuotationDiscountedUnitPrice;
        this.serviceProviderQuotationDiscountAmount = this.serviceProviderQuotationSubTotal - this.serviceProviderQuotationTotal;
    }

    private calculateTotalServiceMinutes(quantity: number): number {
        return quantity * this.unitServiceMinutes;
    }

    private generateTechnicalReport(quantity: number): TechnicalReport {
        return TechnicalReport.generate(quantity);
    }

    public replaceNotesInTechnicalReport(notes: TechnicalNoteDto[]) {
        this.technicalReport = this.technicalReport.replaceNotes(notes);
    }

    public hasTechnicalReportCompleted(): boolean {
        return this.technicalReport.completed;
    }

    public getServicePackageGroupCode(): string {
        return this.servicePackageGroupCode;
    }

    public getQuantity(): number {
        return this.quantity;
    }

    public getServicePackageGroupQuantity(): number {
        return this.servicePackageGroupQuantity;
    }

    public getConsumerQuotationDiscountAmount(): number {
        return this.consumerQuotationDiscountAmount;
    }

    public getConsumerQuotationTotal(): number {
        return this.consumerQuotationTotal;
    }

    public getConsumerQuotationSubTotal(): number {
        return this.consumerQuotationSubTotal;
    }

    public getServiceProviderQuotationDiscountAmount(): number {
        return this.serviceProviderQuotationDiscountAmount;
    }

    public getServiceProviderQuotationTotal(): number {
        return this.serviceProviderQuotationTotal;
    }

    public getServiceProviderQuotationSubTotal(): number {
        return this.serviceProviderQuotationSubTotal;
    }

    public getTotalServiceMinutes(): number {
        return this.totalServiceMinutes;
    }

    public getServiceTypesEntitlement(): number {
        return this.serviceTypesEntitlement;
    }

    private lowestServiceProviderQuotationTierBasedOnQuantity(quantity: number, customerAddressState: string): ServiceProviderQuotation {
        this.sortServiceProviderQuotationsByQuantity();

        this.logger.debug(`quantity: ${quantity}, state: ${customerAddressState}`, 'lowestServiceProviderQuotationTierBasedOnQuantity');
        const stateScopedServicePackageQuotations = this.filterServiceProviderQuotationsByState(customerAddressState);
        for (let i = stateScopedServicePackageQuotations.length - 1; i >= 0; i--) {
            if (quantity >= stateScopedServicePackageQuotations[i].minQuantity) {
                return stateScopedServicePackageQuotations[i];
            }
        }
        return this.serviceProviderQuotations[0];
    }

    private sortServiceProviderQuotationsByQuantity() {
        this.serviceProviderQuotations.sort((a, b) => a.minQuantity - b.minQuantity);
    }

    private filterServiceProviderQuotationsByState(customerAddressState: string): ServiceProviderQuotation[] {
        return this.serviceProviderQuotations.filter(q => q.state?.trim().toUpperCase() === customerAddressState?.trim().toUpperCase());
    }

    public lowestConsumerQuotationTierBasedOnQuantity(quantity: number): ConsumerQuotation {
        this.sortCustomerQuotationsByQuantity();
        for (let i = this.consumerQuotations.length - 1; i >= 0; i--) {
            if (quantity >= this.consumerQuotations[i].minQuantity) {
                return this.consumerQuotations[i];
            }
        }
        return this.consumerQuotations[0];
    }

    private sortCustomerQuotationsByQuantity() {
        this.consumerQuotations.sort((a, b) => a.minQuantity - b.minQuantity);
    }

    public toDto(): RequestedServicePackageDto {
        const dto = new RequestedServicePackageDto();

        dto.consumerQuotationDiscountAmount = this.consumerQuotationDiscountAmount;
        dto.consumerQuotationDiscountedUnitPrice = this.consumerQuotationDiscountedUnitPrice;
        dto.consumerQuotationMinQuantity = this.consumerQuotationMinQuantity;
        dto.consumerQuotationSubTotal = this.consumerQuotationSubTotal;
        dto.consumerQuotationTotal = this.consumerQuotationTotal;
        dto.consumerQuotationUnitPrice = this.consumerQuotationUnitPrice;

        dto.description = this.description;
        dto.name = this.name;
        dto.noteToServiceProvider = this.noteToServiceProvider;
        dto.quantity = this.quantity;
        dto.servicePackageId = this.servicePackageId;

        dto.serviceProviderQuotationDiscountAmount = this.serviceProviderQuotationDiscountAmount;
        dto.serviceProviderQuotationDiscountedUnitPrice = this.serviceProviderQuotationDiscountedUnitPrice;
        dto.serviceProviderQuotationMinQuantity = this.serviceProviderQuotationMinQuantity;
        dto.serviceProviderQuotationTotal = this.serviceProviderQuotationTotal;
        dto.serviceProviderQuotationSubTotal = this.serviceProviderQuotationSubTotal;
        dto.serviceProviderQuotationUnitPrice = this.serviceProviderQuotationUnitPrice;
        dto.serviceProviderQuotationState = this.serviceProviderQuotationState;

        dto.serviceRequestId = this.serviceRequestId;
        dto.technicalReport = this.technicalReport;

        return dto;
    }
}
