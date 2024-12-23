import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { FeedbackOption } from './feedback-option.entity';

@Entity()
export class FeedbackType {
    @PrimaryColumn()
    code: string;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

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

    @OneToMany(
        () => FeedbackOption,
        option => option.type,
    )
    options: FeedbackOption[];

    // Factory pattern.
    static for(code): FeedbackType {
        const feedback = new FeedbackType();
        feedback.code = code;
        return feedback;
    }
}
