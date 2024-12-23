import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityNotFoundError } from '@shared/errors';
import { LocationInput } from '@service-request/dto/location.input';
import { ApplyPromoCodeCommand } from '../../../promotion/commands/apply-promo-code.command';
import { ApplyPromoCodeResult } from '../../../promotion/promotion.dto';
import { ServicePackage } from '../../../service-package/entities/service-package.entity';
import { CustomerOrderInput } from '../../dto/customer-order.input';
import { CustomerOrder } from '../customer-order.entity';
import { RequestedServicePackage } from '../requested-service-package.entity';

@Injectable()
export class CustomerOrderFactory {
    constructor(
        // refactor(roy): use queryBus for cross-module communication.
        @InjectRepository(ServicePackage)
        private readonly servicePackageRepo: Repository<ServicePackage>,
        private commandBus: CommandBus,
    ) {}

    public async create(input: CustomerOrderInput, location: LocationInput, forCommit: boolean): Promise<CustomerOrder> {
        const { remarks, servicePackages, promoCode } = input;
        const promises = servicePackages
            .filter(x => x.quantity > 0)
            .map(async input => {
                const servicePackage = await this.servicePackageRepo.findOne(input.id);
                if (!servicePackage) {
                    throw new EntityNotFoundError('ServicePackage', input.id);
                }

                return new RequestedServicePackage(input.quantity, location.state, servicePackage);
            });

        let customerOrder = new CustomerOrder(remarks, await Promise.all(promises));

        if (promoCode) {
            const appliedPromotion: ApplyPromoCodeResult = await this.commandBus.execute(
                new ApplyPromoCodeCommand(promoCode, customerOrder.consumerTotal, forCommit),
            );
            customerOrder = customerOrder.applyPromotion(appliedPromotion);
        }

        return customerOrder;
    }
}
