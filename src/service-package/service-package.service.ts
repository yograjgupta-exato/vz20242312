import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { GeneralStatus } from '@shared/enums';
import { Tenant } from '@shared/enums/tenant';
import { ServicePackage } from './entities/service-package.entity';

@Injectable()
export class ServicePackageService extends TypeOrmCrudService<ServicePackage> {
    constructor(@InjectRepository(ServicePackage) public repository: Repository<ServicePackage>) {
        super(repository);
    }

    async indexServicePackagesByTenant(tenant: Tenant) {
        return this.repo.find({
            select: ['id', 'name', 'description', 'consumerDisplayGroup', 'consumerQuotations', 'servicePackageGroupCode', 'createdAt', 'updatedAt'],
            where: { status: GeneralStatus.ACTIVE, principalGroup: tenant },
            relations: ['consumerDisplayGroup'],
            order: { sequence: 'ASC' },
            withDeleted: false,
        });
    }
}
