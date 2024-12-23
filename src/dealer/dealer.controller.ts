import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CrudController, Crud, Override, ParsedRequest, CrudRequest, ParsedBody } from '@nestjsx/crud';
import { CustomApiHeaders } from '@shared/decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateDealerDto, UpdateDealerDto } from './dealer.dto';
import { Dealer } from './dealer.entity';
import { DealerService } from './dealer.service';

@ApiTags('service-provider')
@CustomApiHeaders()
@Controller('dealers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Crud({
    model: {
        type: Dealer,
    },
    dto: {
        create: CreateDealerDto,
    },
    query: {
        join: {
            profile: {
                eager: true,
            },
            'profile.skills': {
                eager: false,
            },
            'profile.serviceAreas': {
                eager: true,
            },
        },
    },
})
export class DealerController implements CrudController<Dealer> {
    constructor(public service: DealerService) {}

    @Override()
    createOne(@ParsedRequest() req: CrudRequest, @ParsedBody() dto: CreateDealerDto) {
        return this.service.createOne(req, dto);
    }

    @Override()
    replaceOne(@ParsedRequest() req: CrudRequest, @ParsedBody() dto: UpdateDealerDto) {
        return this.service.replaceOne(req, dto);
    }

    @Override()
    deleteOne(@ParsedRequest() req: CrudRequest): Promise<void | Dealer> {
        return this.service.softDeleteOne(req.parsed.paramsFilter[0].value);
    }
}
