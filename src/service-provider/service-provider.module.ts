import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeController } from './me.controller';
import { QueryHandlers } from './queries/handlers';
import { ServiceProviderController } from './service-provider.controller';
import { ServiceProvider } from './service-provider.entity';
import { ServiceProviderService } from './service-provider.service';

@Module({
    providers: [ServiceProviderService, ...QueryHandlers],
    controllers: [MeController, ServiceProviderController],
    imports: [CqrsModule, TypeOrmModule.forFeature([ServiceProvider])],
    exports: [ServiceProviderService],
})
export class ServiceProviderModule {}
