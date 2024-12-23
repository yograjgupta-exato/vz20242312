import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { DeepPartial, OneToMany, Entity, Column, OneToOne, JoinColumn, RelationId } from 'typeorm';
import { AbstractEntity } from '@shared/entities/abstract.entity';
import { CurrencyCode } from '@shared/enums';
import { ColumnNumericTransformer } from '@shared/typeorm/column-numeric-transformer';
import { IServiceProvider } from '@service-provider/interfaces/service-provider.interface';
import { ServiceProvider } from '@service-provider/service-provider.entity';
import { IWallet } from './interfaces/wallet.interface';
import { WalletTransaction } from './wallet-transaction.entity';

@Entity({ name: 'wallets' })
export class Wallet extends AbstractEntity implements IWallet {
    constructor(input?: DeepPartial<Wallet>) {
        super(input);
    }

    @Column('decimal', {
        default: 0,
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    availableBalance: number;

    @Column({
        default: CurrencyCode.Myr,
        enum: CurrencyCode,
        name: 'currency',
        type: 'enum',
    })
    currency: CurrencyCode;

    @Column('decimal', {
        default: 0,
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    holdBalance: number;

    @OneToOne(() => ServiceProvider)
    @JoinColumn()
    owner: IServiceProvider;

    @ApiHideProperty()
    @Column({ type: 'uuid' })
    @RelationId((w: Wallet) => w.owner)
    @Exclude()
    ownerId: string;

    @Column('decimal', {
        default: 0,
        precision: 13,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
    })
    prepaidBalance: number;

    @OneToMany(
        () => WalletTransaction,
        trx => trx.wallet,
    )
    transactions: WalletTransaction[];

    static fromOwner(ownerId: string): IWallet {
        const wallet = new Wallet();
        wallet.ownerId = ownerId;
        wallet.availableBalance = 0;
        wallet.holdBalance = 0;
        wallet.prepaidBalance = 0;
        return wallet;
    }

    public debit(amount: number) {
        this.availableBalance += amount;
    }

    // todo(roy): question, should we enforce availableBalance > amount?
    public holdBalanceForPayout(amount: number) {
        this.availableBalance -= amount;
        this.holdBalance += amount;
    }

    public releaseBalanceForPayout(amount: number) {
        this.holdBalance -= amount;
    }

    public getOwnerId(): string {
        return this.ownerId;
    }
}
