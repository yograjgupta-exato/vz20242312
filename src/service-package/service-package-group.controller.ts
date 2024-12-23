import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CrudController, Crud, Override, ParsedRequest, ParsedBody, CrudRequest } from '@nestjsx/crud';
import { PROTECTED_ROUTES } from '@shared/crud';
import { CustomApiHeaders } from '@shared/decorators';
import { ServicePackageGroup } from './entities/service-package-group.entity';
import { ServicePackageGroupService } from './service-package-group.service';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';

@ApiTags('service-package-group')
@CustomApiHeaders()
@Controller('service-package-groups')
@Crud({
    model: {
        type: ServicePackageGroup,
    },
    routes: PROTECTED_ROUTES,
    params: {
        id: {
            field: 'id',
            primary: true,
            type: 'string',
        },
    },
})
export class ServicePackageGroupController implements CrudController<ServicePackageGroup> {
    constructor(public service: ServicePackageGroupService) {}

    @Override()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async replaceOne(@ParsedRequest() req: CrudRequest, @ParsedBody() dto: ServicePackageGroup) {
        return this.service.updateOne(req, dto);
    }

    @Override()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async updateOne(@ParsedRequest() req: CrudRequest, @ParsedBody() dto: ServicePackageGroup) {
        return this.service.updateOne(req, dto);
    }
}
