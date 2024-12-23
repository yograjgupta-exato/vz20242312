import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { ServicePackageGroup } from './entities/service-package-group.entity';

@Injectable()
export class ServicePackageGroupService extends TypeOrmCrudService<ServicePackageGroup> {
    constructor(@InjectRepository(ServicePackageGroup) public repository: Repository<ServicePackageGroup>) {
        super(repository);
    }
}
