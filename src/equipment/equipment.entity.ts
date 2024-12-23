import { Min, Max, IsIn } from 'class-validator';
import { Entity, DeepPartial, Column } from 'typeorm';
import { AbstractEntity } from '@shared/entities/abstract.entity';

@Entity()
export class Equipment extends AbstractEntity {
    constructor(input?: DeepPartial<Equipment>) {
        super(input);
    }

    @Column()
    brand: string;

    @Column({ default: 'EA' })
    @IsIn(['EA'])
    unitType: string;

    @Column({ default: '' })
    horsePower: string;

    @Column({ unique: true })
    serialNumber: string;

    @Min(2000)
    @Max(new Date().getFullYear())
    @Column({ nullable: true })
    yearOfManufacture?: number;

    @Column({ default: '' })
    model: string;

    @Column('simple-array', { nullable: true })
    attachmentUrls: string[];

    @Column()
    providerId: string;

    @Column({ nullable: true })
    providerVendorId: string;

    @Column({ nullable: true })
    remark?: string;

    @Column()
    serviceRequestId: string;

    @Column({
        nullable: true,
    })
    crmCustomerId?: string;
}
