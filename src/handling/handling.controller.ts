import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CrudController, Crud, Override, ParsedRequest, CrudRequest, ParsedBody } from '@nestjsx/crud';
import { PROTECTED_ROUTES } from '@shared/crud';
import { CustomApiHeaders } from '@shared/decorators';
import { HandlingEventInput } from './dto/handling-event.input';
import { HandlingEvent } from './entities/handling-event.entity';
import { HandlingService } from './handling.service';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';

@ApiTags('handling')
@CustomApiHeaders()
@Controller('handlings')
@Crud({
    model: {
        type: HandlingEvent,
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
export class HandlingController implements CrudController<HandlingEvent> {
    constructor(public service: HandlingService) {}

    @Override()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    createOne(@ParsedRequest() req: CrudRequest, @ParsedBody() input: HandlingEventInput): Promise<HandlingEvent> {
        return this.service.create(input);
    }
}
