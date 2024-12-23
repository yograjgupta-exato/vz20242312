import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@nestjsx/crud';
import { CustomApiHeaders } from '@shared/decorators';
import { Skill } from './skill.entity';
import { SkillService } from './skill.service';

@ApiTags('skill')
@CustomApiHeaders()
@Controller('skills')
@ApiBearerAuth()
@Crud({
    model: {
        type: Skill,
    },
    params: {
        id: {
            field: 'id',
            type: 'number',
            primary: true,
        },
    },
})
export class SkillController implements CrudController<Skill> {
    constructor(public service: SkillService) {}
}
