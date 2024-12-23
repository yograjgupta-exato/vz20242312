import { DeepPartial, Column, Entity } from 'typeorm';
import { AbstractEntity } from '@shared/entities/abstract.entity';

@Entity({ name: 'consumer_display_groups' })
export class ConsumerDisplayGroup extends AbstractEntity {
    constructor(input?: DeepPartial<ConsumerDisplayGroup>) {
        super(input);
    }

    @Column({ unique: true })
    code: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ nullable: true })
    iconUrl?: string;

    @Column({ default: 1 })
    sequence: number;
}
