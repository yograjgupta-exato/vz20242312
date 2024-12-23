import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Crud, CrudController, CrudRequest, Override, ParsedBody, ParsedRequest } from '@nestjsx/crud';
import { CustomApiHeaders } from '@shared/decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminPromotionService } from './admin-promotion.service';
import { CreatePromotionDto } from './promotion.dto';
import { Promotion } from './promotion.entity';

@ApiTags('admin-promotion')
@CustomApiHeaders()
@Controller('admin/promotions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Crud({
    model: {
        type: Promotion,
    },
    params: {
        id: {
            field: 'id',
            type: 'number',
            primary: true,
        },
    },
})
export class AdminPromotionController implements CrudController<Promotion> {
    constructor(public service: AdminPromotionService) {}

    @Override()
    createOne(@ParsedRequest() req: CrudRequest, @ParsedBody() dto: CreatePromotionDto) {
        if (dto.code) {
            dto.code = dto.code.toLowerCase();
        }
        return this.service.createOne(req, dto);
    }
}
