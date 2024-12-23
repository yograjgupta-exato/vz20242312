import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CrudController, Crud } from '@nestjsx/crud';
import { PROTECTED_ROUTES } from '@shared/crud';
import { CustomApiHeaders } from '@shared/decorators';
import { ServicePackage } from './entities/service-package.entity';
import { ServicePackageService } from './service-package.service';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';

@ApiTags('admin-service-package')
@CustomApiHeaders()
@Controller('admin/service-packages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Crud({
    model: {
        type: ServicePackage,
    },
    routes: PROTECTED_ROUTES,
    params: {
        id: {
            field: 'id',
            primary: true,
            type: 'string',
        },
    },
    query: {
        join: {
            serviceTypes: {
                eager: true,
            },
            consumerQuotations: {
                eager: true,
            },
            serviceProviderQuotations: {
                eager: true,
            },
            consumerDisplayGroup: {
                eager: true,
            },
        },
    },
})
export class AdminServicePackageController implements CrudController<ServicePackage> {
    constructor(public service: ServicePackageService) {}
}
