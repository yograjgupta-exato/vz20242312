import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { ServiceArea } from './entities/service-area.entity';

@Injectable()
export class ServiceAreaService extends TypeOrmCrudService<ServiceArea> {
    constructor(@InjectRepository(ServiceArea) public repository: Repository<ServiceArea>) {
        super(repository);
    }
}
