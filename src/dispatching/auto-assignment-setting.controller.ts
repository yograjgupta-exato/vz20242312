import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CrudController, Crud, Override, ParsedRequest, CrudRequest, ParsedBody } from '@nestjsx/crud';
import { CustomApiHeaders } from '@shared/decorators';
import { AutoAssignmentSettingService } from './auto-assignment-setting.service';
import { AutoAssignmentSettingInput } from './dto/auto-assignment-setting.input';
import { AutoAssignmentSetting } from './entities/auto-assignment-setting.entity';

@ApiTags('auto-assignment-setting')
@CustomApiHeaders()
@Controller('auto-assignment-setting')
@Crud({
    model: {
        type: AutoAssignmentSetting,
    },
    params: {
        id: {
            field: 'id',
            primary: true,
            type: 'string',
        },
    },
})
export class AutoAssignmentSettingController implements CrudController<AutoAssignmentSetting> {
    constructor(public service: AutoAssignmentSettingService) {}

    @Override()
    createOne(@ParsedRequest() req: CrudRequest, @ParsedBody() input: AutoAssignmentSettingInput): Promise<AutoAssignmentSetting> {
        return this.service.create(input);
    }
}
