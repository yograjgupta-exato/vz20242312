import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Transform } from 'class-transformer';
import { IsEmail, Length, IsDefined, IsNumberString } from 'class-validator';
import { Entity, DeepPartial, Column, ManyToOne, JoinColumn, RelationId, JoinTable, ManyToMany, AfterLoad, Index } from 'typeorm';
import { DEFAULT_COUNTRY_CODE } from '@shared/constants';
import { AbstractEntity } from '@shared/entities/abstract.entity';
import { IdentificationType } from '@shared/enums/identification-type';
import { ServiceProviderType } from '@shared/enums/service-provider-type';
import { UserStatus } from '@shared/enums/user-status';
import { Dealer } from '../dealer/dealer.entity';
import { ServiceArea } from '../service-area/entities/service-area.entity';
import { Skill } from '../skill/skill.entity';
import { IServiceProvider } from './interfaces/service-provider.interface';
import { ServiceProviderDto } from './service-provider.dto';

export class Bank {
    @Column({ name: '_name', nullable: true })
    bankName?: string;
    @Column({ name: '_account_holder_name', nullable: true })
    accountHolderName?: string;
    @Column({ name: '_account_number', nullable: true })
    accountNumber?: string;
    @Column({ name: '_id_type', nullable: true })
    idType?: IdentificationType;
    @Column({ name: '_id_number', nullable: true })
    idNumber?: string;
    @Column({ name: '_display_name', nullable: true })
    bankDisplayName?: string;
    @Column({ name: '_swift_code', nullable: true })
    swiftCode?: string;
}

export class Address {
    @Column({ nullable: true })
    companyName?: string = null;
    @Column({ nullable: true })
    buildingName?: string = null;
    @Column()
    streetLine1: string = null;
    @Column({ nullable: true })
    streetLine2?: string = null;
    @Column({ name: '_city' })
    city: string = null;
    @Column({ name: '_state' })
    state: string = null;
    @Column({ name: '_postal_code' })
    postalCode: string = null;
    @Column({ name: '_country', default: DEFAULT_COUNTRY_CODE })
    country: string = null;

    public toString(delimiter = ', '): string {
        return (
            Object.entries(this)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .map(([_, v]) => v)
                .filter(v => !!v)
                .join(delimiter)
                .trim()
        );
    }
}

export class Vehicle {
    @Column({ nullable: true })
    number: string;
    @Column('simple-array', { name: '_attachments', nullable: true })
    attachments?: string[];
}

export class EmergencyContact {
    @Column({ nullable: true })
    name: string;
    @Column({ nullable: true })
    number: string;
}

@Entity()
export class ServiceProvider extends AbstractEntity implements IServiceProvider {
    constructor(input?: DeepPartial<ServiceProvider>) {
        super(input);
    }

    @Column()
    @Length(3, 100)
    @IsDefined({ always: true })
    name: string;

    @Column()
    @Index()
    @IsNumberString()
    @IsDefined({ always: true })
    phoneNumber: string;

    @Column()
    @Index()
    @IsEmail()
    @IsDefined({ always: true })
    @Transform(emailAddress => emailAddress.toLowerCase())
    emailAddress: string;

    @Column({ nullable: true })
    profilePicture?: string;

    @Column()
    idType: IdentificationType;

    @Column()
    idNumber: string;

    @Column('simple-array', { nullable: true })
    idAttachments?: string[];

    @Column(() => Bank)
    bank?: Bank;

    @Column(() => Address)
    address?: Address;

    @Column(() => EmergencyContact)
    emergencyContact?: EmergencyContact;

    @Column(() => Vehicle)
    vehicle?: Vehicle;

    @Column({ nullable: true })
    remark?: string;

    @Column('decimal', { default: 5.0, precision: 3, scale: 2 })
    rating: number;

    @Column({ default: 0 })
    ratingCount: number;

    @ApiProperty({
        description: 'The latitude coordinates of the location',
        format: 'float',
        type: 'number',
    })
    @Column('decimal', {
        comment: 'The latitude coordinates of the location',
        name: 'latitude',
        nullable: true,
        precision: 10,
        scale: 6,
    })
    latitude?: number;

    @ApiProperty({
        description: 'The longitude coordinates of the location',
        format: 'float',
        type: 'number',
    })
    @Column('decimal', {
        comment: 'The longitude coordinates of the location',
        name: 'longitude',
        nullable: true,
        precision: 10,
        scale: 6,
    })
    longitude?: number;

    @Column({
        type: Boolean,
        default: false,
    })
    isOnDuty: boolean;

    @Column({
        name: 'general_status',
        type: 'enum',
        enum: UserStatus,
        default: UserStatus.ACTIVE,
    })
    generalStatus: UserStatus;

    @Column({
        name: 'type',
        type: 'enum',
        enum: ServiceProviderType,
        default: ServiceProviderType.INDEPENDENT,
    })
    type: ServiceProviderType;

    @ManyToOne(
        () => Dealer,
        dealer => dealer.serviceProviders,
        {
            eager: true,
        },
    )
    @JoinColumn()
    dealer?: Dealer;

    @Column({ nullable: true, type: 'uuid' })
    @RelationId((serviceProvider: ServiceProvider) => serviceProvider.dealer)
    @Exclude()
    dealerId?: string;

    @ManyToMany(() => ServiceArea)
    @JoinTable()
    serviceAreas: ServiceArea[];

    @ManyToMany(() => Skill)
    @JoinTable()
    skills: Skill[];

    @Column({ default: 0 })
    skillEntitlement: number;

    @Column({ nullable: true, unique: true })
    vendorId?: string;

    @AfterLoad()
    load() {
        let validUrl = true;
        try {
            new URL(this.profilePicture);
        } catch (_) {
            validUrl = false;
        }

        // refactor(roy): read it from proper config service
        this.profilePicture = validUrl ? this.profilePicture : process.env.DEFAULT_AVATAR_URL;
    }

    public isIndependent(): boolean {
        return this.type === ServiceProviderType.INDEPENDENT;
    }

    public isDealer(): boolean {
        return this.type === ServiceProviderType.DEALER;
    }

    public isWorker(): boolean {
        return this.type === ServiceProviderType.WORKER;
    }

    public getId(): string {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getEmailAddress(): string {
        return this.emailAddress;
    }

    public getPhone(): string {
        return this.phoneNumber;
    }

    public getProfilePicture(): string {
        return this.profilePicture;
    }

    public getBankInfo(): Bank {
        return this.bank;
    }

    public getAddressString(delimiter = ', '): string {
        return this.address.toString(delimiter);
    }

    public getVendorId(): string {
        return this.vendorId;
    }

    public toDto(): ServiceProviderDto {
        return this;
    }

    static calculateSkillEntitlement(skils: Skill[]): number {
        let value = 0;
        if (skils && skils.length > 0) {
            skils.forEach(x => {
                value = value + (x.id === 1 ? 1 : (x.id - 1) * 2);
            });

            return value;
        }

        return value;
    }
}
