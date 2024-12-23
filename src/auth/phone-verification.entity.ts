import { IsDefined, IsNumberString } from 'class-validator';
import * as moment from 'moment';
import { DeepPartial, Column, Entity, Index } from 'typeorm';
import { AbstractEntity } from '@shared/entities/abstract.entity';

@Entity({
    name: 'phone_verifications',
})
export class PhoneVerification extends AbstractEntity {
    constructor(input?: DeepPartial<PhoneVerification>) {
        super(input);
    }

    @Index()
    @Column()
    @IsDefined({ always: true })
    otpToken: number;

    @Column({ type: 'timestamptz' })
    expiredAt: Date;

    @Column({ type: 'timestamptz' })
    nextRequestAt: Date;

    @Column()
    @IsNumberString()
    @IsDefined({ always: true })
    phoneNumber: string;

    public changeExpiryTimeWindow(seconds: number) {
        this.expiredAt = moment
            .utc()
            .add(seconds, 'seconds')
            .toDate();
    }

    public changeRequestTimeWindow(seconds: number) {
        this.nextRequestAt = moment
            .utc()
            .add(seconds, 'seconds')
            .toDate();
    }

    public expiresInSeconds(now: Date): number {
        return moment.utc(this.expiredAt).diff(moment.utc(now), 'seconds');
    }

    public numberOfSecondsBeforeNextRequest(now: Date): number {
        return moment.utc(this.nextRequestAt).diff(moment.utc(now), 'seconds');
    }

    public numberOfSecondsBeforeExpiry(now: Date): number {
        return moment.utc(this.expiredAt).diff(moment.utc(now), 'seconds');
    }

    public isBeforeExpiry(now: Date): boolean {
        return this.numberOfSecondsBeforeExpiry(now) >= 0;
    }

    public isWithinRateLimit(now: Date): boolean {
        return this.numberOfSecondsBeforeNextRequest(now) <= 0;
    }
}
