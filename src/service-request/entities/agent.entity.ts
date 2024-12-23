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

    @Column({
        name: '_profile_picture',
        nullable: true,
    })
    profilePicture?: string;

    rating?: number;

    public constructor(id: string, name: string, phone: string, profilePicture: string) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.profilePicture = profilePicture;
    }
}
