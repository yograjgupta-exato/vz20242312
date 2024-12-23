import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsDefined } from 'class-validator';
import { Entity, Column, OneToMany, OneToOne, RelationId, JoinColumn } from 'typeorm';
import { AbstractEntity } from '@shared/entities/abstract.entity';
import { GeneralStatus } from '@shared/enums';
import { ServiceProvider, Address } from '../service-provider/service-provider.entity';

@Entity()
export class Dealer extends AbstractEntity {
    @Column()
    @IsDefined({ always: true })
    companyName: string;

    @Column()
    @IsDefined({ always: true })
    companyRegistrationNumber: string;

    @Column('simple-array', { nullable: true })
    companyRegistrationImages: string[];

    @Column(() => Address)
    companyAddress: Address;

    @OneToOne(() => ServiceProvider, { cascade: ['update'] })
    @JoinColumn()
    profile: ServiceProvider;

    @ApiHideProperty()
    @Column({ nullable: true, type: 'uuid' })
    @RelationId((join: Dealer) => join.profile)
    @Exclude()
    profileId: string;

    @Column({
        type: 'enum',
        enum: GeneralStatus,
        default: GeneralStatus.ACTIVE,
    })
    status: GeneralStatus;

    @OneToMany(
        () => ServiceProvider,
        serviceProvider => serviceProvider.dealer,
        { cascade: false, eager: false },
    )
    serviceProviders: ServiceProvider[];
}
