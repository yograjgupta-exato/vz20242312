import { Promotion } from './promotion.entity';

export class ValidatePromotionResult {
    code: string;
    isValid: boolean;
    error?: Error;
}

export class ApplyPromoCodeResult {
    code: string;
    discountedAmount: number;
    originalTotal: number;
    discountedTotal: number;
}

export class CreatePromotionDto extends Promotion {}
