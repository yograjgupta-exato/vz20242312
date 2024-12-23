import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminConsumerDisplayGroupController } from './admin-consumer-display-group.controller';
import { AdminServicePackageController } from './admin-service-package.controller';
import { ConsumerDisplayGroupService } from './consumer-display-group.service';
import { ConsumerDisplayGroup } from './entities/consumer-display-group.entity';
import { ServicePackageGroup } from './entities/service-package-group.entity';
import { ServicePackage } from './entities/service-package.entity';
import { ServicePackageGroupController } from './service-package-group.controller';
import { ServicePackageGroupService } from './service-package-group.service';
import { ServicePackageController } from './service-package.controller';
import { ServicePackageService } from './service-package.service';
import { ServicePackageSubscriber } from './service-package.subscriber';

@Module({
    controllers: [AdminServicePackageController, ServicePackageController, ServicePackageGroupController, AdminConsumerDisplayGroupController],
    providers: [ServicePackageService, ServicePackageGroupService, ConsumerDisplayGroupService, ServicePackageSubscriber],
    imports: [CqrsModule, TypeOrmModule.forFeature([ServicePackage, ServicePackageGroup, ConsumerDisplayGroup])],
    exports: [ServicePackageService, ServicePackageGroupService, ConsumerDisplayGroupService],
})
export class ServicePackageModule {}
