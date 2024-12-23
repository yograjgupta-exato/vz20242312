import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { GeneralStatus } from '../../shared/enums';
import { PromotionCodeInvalidError, PromotionCodeUsageLimitError } from '../../shared/errors';
import { ApplyPromoCodeResult } from '../promotion.dto';
import { Promotion } from '../promotion.entity';
import { ApplyPromoCodeCommand } from './apply-promo-code.command';

@CommandHandler(ApplyPromoCodeCommand)
export class ApplyPromoCodeHandler implements ICommandHandler<ApplyPromoCodeCommand> {
    private readonly logger = new Logger(ApplyPromoCodeHandler.name);
    constructor(
        @InjectRepository(Promotion)
        protected readonly repository: Repository<Promotion>,
    ) {}

    async execute(command: ApplyPromoCodeCommand): Promise<ApplyPromoCodeResult> {
        this.logger.debug(command);
        const { promoCode, totalAmount, forCommit } = command;
        const promotion = await this.repository.findOne({ code: promoCode, status: GeneralStatus.ACTIVE });

        if (!promotion) {
            throw new PromotionCodeInvalidError(promoCode);
        }

        const validationResult = await promotion.isValid();

        if (!validationResult.isValid) {
            throw validationResult.error;
        }

        const result = await promotion.apply(totalAmount);

        if (forCommit) {
            const updateResult = await this.repository.increment(
                {
                    code: promoCode,
                    usageLimit: Raw(alias => `(${alias} IS NULL OR usageLimit > usageCount)`),
                },
                'usageCount',
                1,
            );
            if (!(updateResult.affected > 0)) {
                throw new PromotionCodeUsageLimitError(promoCode, promotion.usageLimit);
            }
        }

        return result;
    }
}
