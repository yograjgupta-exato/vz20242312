import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { ServiceType } from './service-type.entity';

@Injectable()
export class ServiceTypeService extends TypeOrmCrudService<ServiceType>  {
  constructor(
    @InjectRepository(ServiceType) public repository: Repository<ServiceType>,
  ) {
    super(repository);
  }
}
