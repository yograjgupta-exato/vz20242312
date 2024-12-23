import { Logger } from '@nestjs/common';
import { Entity, DeepPartial, Column, ManyToMany, JoinTable, BeforeInsert, BeforeUpdate, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractEntity } from '@shared/entities/abstract.entity';
import { OptPeriod } from '@shared/entities/opt-period.entity';
import { GeneralStatus, Tenant } from '@shared/enums';
import { UserInputError } from '@shared/errors';
import { ServiceType } from '../../service-type/service-type.entity';
import { ConsumerDisplayGroup } from './consumer-display-group.entity';
import { ConsumerQuotation } from './consumer-quotation.entity';
import { IServicePackage } from './interfaces/service-package.interface';
import { ServiceProviderQuotation } from './service-provider-quotation.entity';

@Entity({ name: 'service_packages' })
export class ServicePackage extends AbstractEntity implements IServicePackage {
    constructor(input?: DeepPartial<ServicePackage>) {
        super(input);
    }

    @Column('simple-json')
    consumerQuotations: ConsumerQuotation[];

    @Column('text', { nullable: true })
    description?: string;

    @Column()
    name: string;

    @Column('text', { nullable: true })
    noteToServiceProvider?: string;

    @Column('text', { nullable: true })
    remarks?: string;

    @Column('simple-json')
    serviceProviderQuotations: ServiceProviderQuotation[];

    @Column()
    servicePackageGroupCode: string;

    @ManyToOne(() => ConsumerDisplayGroup)
    @JoinColumn()
    consumerDisplayGroup: ConsumerDisplayGroup;

    @ManyToMany(() => ServiceType, { cascade: true, eager: true })
    @JoinTable()
    serviceTypes: ServiceType[];

    @Column({
        name: 'general_status',
        type: 'enum',
        enum: GeneralStatus,
        default: GeneralStatus.ACTIVE,
    })
    status: GeneralStatus;

    @Column('simple-json', { nullable: true })
    tags?: string[];

    @Column({
        name: 'principal_group',
        type: 'enum',
        enum: Tenant,
        default: Tenant.Daikin,
    })
    principalGroup: Tenant;

    @Column({ default: 45 })
    unitServiceMinutes: number;

    @Column(() => OptPeriod)
    validity: OptPeriod;

    @Column({ default: 1 })
    sequence: number;

    @BeforeInsert()
    @BeforeUpdate()
    sortQuotations() {
        this.sortServiceProviderQuotationsByQuantity();
        this.sortCustomerQuotationsByQuantity();
    }
    private readonly logger = new Logger(ServicePackage.name);

    public addConsumerQuotation(consumerQuotation: ConsumerQuotation) {
        if (!this.consumerQuotations) {
            this.consumerQuotations = [];
        }

        this.consumerQuotations.push(consumerQuotation);
    }

    public getConsumerQuotations(): ConsumerQuotation[] {
        return this.consumerQuotations;
    }

    public getServiceProviderQuotations(): ServiceProviderQuotation[] {
        return this.serviceProviderQuotations;
    }

    public addServiceProviderQuotation(serviceProviderQuotation: ServiceProviderQuotation) {
        if (!this.serviceProviderQuotations) {
            this.serviceProviderQuotations = [];
        }

        if (!serviceProviderQuotation.state?.trim()) {
            throw new UserInputError("service provider quotation's state can't be null", { state: serviceProviderQuotation.state });
        }

        this.serviceProviderQuotations.push(serviceProviderQuotation);
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

    public lowestServiceProviderQuotationTierBasedOnQuantity(quantity: number, customerAddressState: string): ServiceProviderQuotation {
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

    public getServicePackageGroupCode(): string {
        return this.servicePackageGroupCode;
    }

    public getUnitServiceMinutes(): number {
        return this.unitServiceMinutes;
    }

    public getServiceTypesEntitlement(): number {
        // eslint-disable-next-line no-bitwise
        return this.serviceTypes?.reduce((entitlement, st) => entitlement | st.bitFlag, 0) ?? 0;
    }

    public getName(): string {
        return this.name;
    }
    public getDescription(): string {
        return this.description;
    }
    public getNoteToServiceProvider(): string {
        return this.noteToServiceProvider;
    }
    public getConsumerDisplayGroup(): ConsumerDisplayGroup {
        return this.consumerDisplayGroup;
    }

    private sortCustomerQuotationsByQuantity() {
        this.consumerQuotations.sort((a, b) => a.minQuantity - b.minQuantity);
    }

    private sortServiceProviderQuotationsByQuantity() {
        this.serviceProviderQuotations.sort((a, b) => a.minQuantity - b.minQuantity);
    }

    private filterServiceProviderQuotationsByState(customerAddressState: string): ServiceProviderQuotation[] {
        return this.serviceProviderQuotations.filter(q => q.state?.trim().toUpperCase() === customerAddressState?.trim().toUpperCase());
    }
}
