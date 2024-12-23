import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { CustomApiHeaders } from '@shared/decorators';
import { Tenant } from '@shared/enums';
import { ServicePackageService } from './service-package.service';

@ApiTags('service-package')
@CustomApiHeaders()
@Controller('service-packages')
export class ServicePackageController {
    constructor(private readonly service: ServicePackageService) {}

    @Get()
    @ApiQuery({ name: 'group', enum: Tenant })
    async indexServicePackages(@Query('group') group: Tenant) {
        return this.service.indexServicePackagesByTenant(group?.toUpperCase() === Tenant.Acson ? Tenant.Acson : Tenant.Daikin);
    }
}
