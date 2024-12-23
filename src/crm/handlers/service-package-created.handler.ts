import { Logger } from '@nestjs/common';
import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { ServicePackageCreatedEvent } from '@cqrs/events/service-package.event';
import { ProductCategoryID, BaseUOM } from '../crm.enum';
import { IProduct } from '../crm.interface';
import { CRMService } from '../crm.service';

@EventsHandler(ServicePackageCreatedEvent)
export class ServicePackageCreatedHandler implements IEventHandler<ServicePackageCreatedEvent> {
    constructor(private readonly crmService: CRMService) {}
    private readonly logger = new Logger(ServicePackageCreatedHandler.name);

    async handle(event: ServicePackageCreatedEvent) {
        const product: IProduct = {
            ProductID: event.servicePackage.id,
            Description: event.servicePackage.name,
            ProductCategoryID: ProductCategoryID.ServicePack,
            BaseUOM: BaseUOM.EA,
        };

        await this.crmService.createOrUpdateProduct(product);
        this.logger.log(event, 'ServicePackageCreatedEvent');
    }
}
