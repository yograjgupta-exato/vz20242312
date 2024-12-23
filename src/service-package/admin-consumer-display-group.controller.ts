import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CrudController, Crud, Override, ParsedRequest, ParsedBody, CrudRequest } from '@nestjsx/crud';
import { PROTECTED_ROUTES } from '@shared/crud';
import { CustomApiHeaders } from '@shared/decorators';
import { ConsumerDisplayGroupService } from './consumer-display-group.service';
import { ConsumerDisplayGroup } from './entities/consumer-display-group.entity';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';

@ApiTags('admin-consumer-display-group')
@CustomApiHeaders()
@Controller('admin/consumer-display-groups')
@Crud({
    model: {
        type: ConsumerDisplayGroup,
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
export class AdminConsumerDisplayGroupController implements CrudController<ConsumerDisplayGroup> {
    constructor(public service: ConsumerDisplayGroupService) {}

    @Override()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async replaceOne(@ParsedRequest() req: CrudRequest, @ParsedBody() dto: ConsumerDisplayGroup) {
        return this.service.updateOne(req, dto);
    }

    @Override()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async updateOne(@ParsedRequest() req: CrudRequest, @ParsedBody() dto: ConsumerDisplayGroup) {
        return this.service.updateOne(req, dto);
    }
}
