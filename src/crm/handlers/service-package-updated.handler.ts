import { Logger } from '@nestjs/common';
import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { ServicePackageUpdatedEvent } from '@cqrs/events/service-package.event';
import { ProductCategoryID, BaseUOM } from '../crm.enum';
import { IProduct } from '../crm.interface';
import { CRMService } from '../crm.service';

@EventsHandler(ServicePackageUpdatedEvent)
export class ServicePackageUpdatedHandler implements IEventHandler<ServicePackageUpdatedEvent> {
    constructor(private readonly crmService: CRMService) {}
    private readonly logger = new Logger(ServicePackageUpdatedHandler.name);

    async handle(event: ServicePackageUpdatedEvent) {
        const product: IProduct = {
            ProductID: event.servicePackage.id,
            Description: event.servicePackage.name,
            ProductCategoryID: ProductCategoryID.ServicePack,
            BaseUOM: BaseUOM.EA,
        };

        await this.crmService.createOrUpdateProduct(product);
        this.logger.log(event, 'ServicePackageUpdatedEvent');
    }
}
