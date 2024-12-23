import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, DeepPartial, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { GeneralStatus } from '../shared/enums';
import { PromotionCodeExpiredError, PromotionCodeInvalidError, PromotionCodeUsageLimitError } from '../shared/errors';
import { ApplyPromoCodeResult, ValidatePromotionResult } from './promotion.dto';
import { DiscountType } from './promotion.enum';

export class Discount {
    @Column({ type: 'enum', enum: DiscountType, nullable: false })
    discountType: DiscountType;

    @Column({ type: 'float', nullable: false })
    discountValue: number;

    @Column({ type: 'float', nullable: true })
    amountLimit?: number;
}

@Entity()
export class Promotion {
    public constructor(input?: DeepPartial<Promotion>) {
        if (input) {
            for (const [key, value] of Object.entries(input)) {
                (this as any)[key] = value;
            }
        }
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    @Index()
    code: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: Date, nullable: true })
    startsAt?: Date;

    @Column({ type: Date, nullable: true })
    endsAt?: Date;

    @Column({ type: 'int', default: 1 })
    usageLimit: number;

    @Column({ type: 'int', default: 0 })
    usageCount: number;

    @Column(() => Discount)
    discount: Discount;

    @Column({
        name: 'general_status',
        type: 'enum',
        enum: GeneralStatus,
        default: GeneralStatus.ACTIVE,
    })
    status: GeneralStatus;

    @CreateDateColumn({
        type: 'timestamptz',
        name: 'created_at',
    })
    createdAt: Date;

    @CreateDateColumn({
        type: 'timestamptz',
        name: 'updated_at',
    })
    updatedAt: Date;

    @CreateDateColumn({
        type: 'timestamptz',
        name: 'deleted_at',
    })
    @Exclude()
    @ApiHideProperty()
    deletedAt: Date;

    async isValid(): Promise<ValidatePromotionResult> {
        if (this.endsAt && this.endsAt < new Date()) {
            return { code: this.code, isValid: false, error: new PromotionCodeExpiredError(this.code) };
        }
        if (this.startsAt && this.startsAt > new Date()) {
            return { code: this.code, isValid: false, error: new PromotionCodeInvalidError(this.code) };
        }
        if (this.usageCount >= this.usageLimit) {
            return { code: this.code, isValid: false, error: new PromotionCodeUsageLimitError(this.code, this.usageLimit) };
        }
        return { code: this.code, isValid: true };
    }

    async apply(totalAmount: number): Promise<ApplyPromoCodeResult> {
        let discountedAmount: number;
        if (this.discount.discountType === DiscountType.NUMERIC) {
            discountedAmount = Math.min(Math.min(this.discount.discountValue, this.discount.amountLimit || totalAmount), totalAmount);
        } else {
            const discount = Math.min((totalAmount * this.discount.discountValue) / 100, this.discount.amountLimit || totalAmount);
            discountedAmount = Math.min(discount, totalAmount);
        }

        return {
            code: this.code,
            discountedAmount,
            originalTotal: totalAmount,
            discountedTotal: totalAmount - discountedAmount,
        };
    }
}
