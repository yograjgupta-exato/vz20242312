import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PromotionCodeExpiredError, PromotionCodeInvalidError, PromotionCodeUsageLimitError } from '../../shared/errors';
import { MockRepository } from '../../shared/mocks/mock-repository';
import { ApplyPromoCodeResult } from '../promotion.dto';
import { Promotion } from '../promotion.entity';
import { DiscountType } from '../promotion.enum';
import { ApplyPromoCodeCommand } from './apply-promo-code.command';
import { ApplyPromoCodeHandler } from './apply-promo-code.handler';

describe('ApplyPromoCodeHandler', () => {
    let handler: ApplyPromoCodeHandler;
    let mockedPromotionRepo: MockRepository<Promotion>;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [],
            controllers: [],
            providers: [
                ApplyPromoCodeHandler,
                {
                    provide: getRepositoryToken(Promotion),
                    useValue: new MockRepository<Promotion>(),
                },
            ],
        }).compile();

        handler = moduleRef.get(ApplyPromoCodeHandler);
        mockedPromotionRepo = moduleRef.get(getRepositoryToken(Promotion));
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
        expect(mockedPromotionRepo).toBeDefined();
    });

    describe('execute', () => {
        it('should throw PromotionCodeInvalidError if promo code entered does not exists', async () => {
            mockedPromotionRepo.findOne.mockResolvedValueOnce(null);
            await expect(handler.execute(new ApplyPromoCodeCommand('something-not-valid', 100))).rejects.toThrowError(PromotionCodeInvalidError);
        });

        it('should throw PromotionCodeInvalidError if startsAt too earlier than current time', async () => {
            const now = new Date();
            const promotion = new Promotion({ code: 'promo-code-too-early', startsAt: now.setDate(now.getDate() + 3) });

            mockedPromotionRepo.findOne.mockResolvedValueOnce(promotion);
            await expect(handler.execute(new ApplyPromoCodeCommand(promotion.code, 100))).rejects.toThrowError(PromotionCodeInvalidError);
        });

        it('should throw PromotionCodeExpiredError if current time over than endsAt', async () => {
            const now = new Date();
            const promotion = new Promotion({
                code: 'promo-code-expired',
                startsAt: now.setDate(now.getDate() - 7),
                endsAt: now.setDate(now.getDate() - 1),
            });

            mockedPromotionRepo.findOne.mockResolvedValueOnce(promotion);
            await expect(handler.execute(new ApplyPromoCodeCommand(promotion.code, 100))).rejects.toThrowError(PromotionCodeExpiredError);
        });

        it('should throw PromotionCodeUsageLimitError if usage limit reached', async () => {
            const promotion = new Promotion({ code: 'promo-code-limit-reached', usageCount: 1, usageLimit: 1 });

            mockedPromotionRepo.findOne.mockResolvedValueOnce(promotion);
            await expect(handler.execute(new ApplyPromoCodeCommand(promotion.code, 100))).rejects.toThrowError(PromotionCodeUsageLimitError);
        });

        it('should return with ApplyPromoCodeResult', async () => {
            const promotion = new Promotion({
                code: 'valid-promo',
                usageCount: 0,
                usageLimit: 1,
                discount: { discountType: DiscountType.NUMERIC, discountValue: 20 },
            });
            mockedPromotionRepo.findOne.mockResolvedValueOnce(promotion);
            const response: ApplyPromoCodeResult = await handler.execute(new ApplyPromoCodeCommand(promotion.code, 100));
            expect(response).toStrictEqual({
                code: promotion.code,
                discountedAmount: 20,
                originalTotal: 100,
                discountedTotal: 80,
            } as ApplyPromoCodeResult);
        });

        it('should return with ApplyPromoCodeResult with correct amount based on discount percentage', async () => {
            const promotion = new Promotion({
                code: 'valid-promo-with-amount-limit',
                usageCount: 0,
                usageLimit: 1,
                discount: { discountType: DiscountType.PERCENTAGE, discountValue: 50, amountLimit: 200 },
            });
            mockedPromotionRepo.findOne.mockResolvedValueOnce(promotion);
            const response: ApplyPromoCodeResult = await handler.execute(new ApplyPromoCodeCommand(promotion.code, 240));
            expect(response).toStrictEqual({
                code: promotion.code,
                discountedAmount: 120,
                originalTotal: 240,
                discountedTotal: 120,
            } as ApplyPromoCodeResult);
        });

        it('should return with ApplyPromoCodeResult with correct amount limit', async () => {
            const promotion = new Promotion({
                code: 'valid-promo-with-amount-limit',
                usageCount: 0,
                usageLimit: 1,
                discount: { discountType: DiscountType.PERCENTAGE, discountValue: 50, amountLimit: 100 },
            });
            mockedPromotionRepo.findOne.mockResolvedValueOnce(promotion);
            const response: ApplyPromoCodeResult = await handler.execute(new ApplyPromoCodeCommand(promotion.code, 240));
            expect(response).toStrictEqual({
                code: promotion.code,
                discountedAmount: 100,
                originalTotal: 240,
                discountedTotal: 140,
            } as ApplyPromoCodeResult);
        });
    });
});
