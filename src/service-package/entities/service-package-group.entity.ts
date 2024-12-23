import { DeepPartial, Column, Entity } from 'typeorm';
import { AbstractEntity } from '@shared/entities/abstract.entity';

// NOTE: ServicePackageGroup is used for volume discount
@Entity({ name: 'service_package_groups' })
export class ServicePackageGroup extends AbstractEntity {
    constructor(input?: DeepPartial<ServicePackageGroup>) {
        super(input);
    }

    @Column({ unique: true })
    code: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    description?: string;
}
