import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    JoinTable,
    ManyToMany,
    EventSubscriber,
    EntitySubscriberInterface,
    InsertEvent,
    DeleteDateColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { GeneralStatus } from '@shared/enums/general-status';
import { Skill } from '../skill/skill.entity';

@Entity()
export class ServiceType {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    code: string;

    @Column()
    name: string;

    @Column('text')
    description: string;

    @Column({ unique: true, default: 0 })
    bitFlag: number;

    @Column({
        name: 'general_status',
        type: 'enum',
        enum: GeneralStatus,
        default: GeneralStatus.ACTIVE,
    })
    status: GeneralStatus;

    @Column({
        type: 'simple-json',
        nullable: true,
    })
    tags: string[];

    @ManyToMany(() => Skill)
    @JoinTable()
    skills: Skill[];

    @CreateDateColumn({
        type: 'timestamptz',
        name: 'created_at',
    })
    createdAt: Date;

    @UpdateDateColumn({
        type: 'timestamptz',
        name: 'updated_at',
    })
    updatedAt: Date;

    @DeleteDateColumn({
        type: 'timestamptz',
        name: 'deleted_at',
    })
    @Exclude()
    @ApiHideProperty()
    deletedAt: Date;
}

@EventSubscriber()
export class ServiceTypeSubscriber implements EntitySubscriberInterface<ServiceType> {
    listenTo() {
        return ServiceType;
    }

    async afterInsert(event: InsertEvent<ServiceType>) {
        const entity = event.entity;
        entity.bitFlag = entity.id === 1 ? 1 : (entity.id - 1) * 2;

        await event.manager.getRepository(ServiceType).save(entity);
    }
}
