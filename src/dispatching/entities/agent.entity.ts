import { Column } from 'typeorm';

export class Agent {
    @Column({
        name: '_id',
        nullable: true,
        type: 'uuid',
    })
    id?: string;

    @Column({
        name: '_name',
        nullable: true,
    })
    name?: string;

    @Column({
        name: '_phone',
        nullable: true,
    })
    phone?: string;
}
