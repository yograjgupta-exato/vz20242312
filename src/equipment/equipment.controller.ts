import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CrudController, Crud } from '@nestjsx/crud';
import { CustomApiHeaders } from '@shared/decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateEquipmentInput } from './equipment.dto';
import { Equipment } from './equipment.entity';
import { EquipmentService } from './equipment.service';

@ApiTags('equipment')
@CustomApiHeaders()
@Controller('equipments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Crud({
    model: {
        type: Equipment,
    },
    dto: {
        create: CreateEquipmentInput,
    },
})
export class EquipmentController implements CrudController<Equipment> {
    constructor(public service: EquipmentService) {}
}
