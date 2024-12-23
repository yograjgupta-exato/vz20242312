import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, RelationId, UpdateDateColumn } from 'typeorm';
import { ServiceRequest } from '../service-request/entities/service-request.entity';
import { ColumnNumericTransformer } from '../shared/typeorm/column-numeric-transformer';

@Entity()
export class Refund {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('decimal', {
        default: 0,
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    amount: number;

    @Column({ nullable: true })
    referenceNumber?: string;

    @Column({ nullable: true })
    remarks?: string;

    @ApiHideProperty()
    @OneToOne(() => ServiceRequest)
    @JoinColumn()
    serviceRequest: ServiceRequest;

    @ApiHideProperty()
    @Column({ type: 'uuid' })
    @RelationId((r: Refund) => r.serviceRequest)
    @Exclude()
    serviceRequestId: string;

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
}
