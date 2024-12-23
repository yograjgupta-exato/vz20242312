import { IsDefined } from 'class-validator';
import { Entity, Column } from 'typeorm';
import { AbstractEntity } from '@shared/entities/abstract.entity';

@Entity()
export class Announcement extends AbstractEntity {
    @Column()
    @IsDefined({ always: true })
    message: string;
}
