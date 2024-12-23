import { Entity, Column, PrimaryGeneratedColumn, EventSubscriber, EntitySubscriberInterface, InsertEvent } from 'typeorm';
import { GeneralStatus } from '@shared/enums/general-status';

@Entity()
export class Skill {
    @PrimaryGeneratedColumn()
    id: number;

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

    @Column('simple-array', { nullable: true })
    attachmentUrls: string[];
}

@EventSubscriber()
export class SkillSubscriber implements EntitySubscriberInterface<Skill> {
    listenTo() {
        return Skill;
    }

    async afterInsert(event: InsertEvent<Skill>) {
        const entity = event.entity;
        entity.bitFlag = entity.id === 1 ? 1 : (entity.id - 1) * 2;

        await event.manager.getRepository(Skill).save(entity);
    }
}
