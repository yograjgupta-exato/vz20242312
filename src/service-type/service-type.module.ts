import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ServiceTypeController } from './service-type.controller';
import { ServiceType } from './service-type.entity';
import { ServiceTypeService } from './service-type.service';

@Module({
  controllers: [ServiceTypeController],
  providers: [ServiceTypeService],
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([ServiceType]),
    AuthModule,
  ],
  exports: [ServiceTypeService]
})
export class ServiceTypeModule {}
