import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@nestjsx/crud';
import { CustomApiHeaders } from '@shared/decorators';
import { ServiceType } from './service-type.entity';
import { ServiceTypeService } from './service-type.service';

@ApiTags('service-type')
@CustomApiHeaders()
@Controller('service-types')
@ApiBearerAuth()
@Crud({
    model: {
        type: ServiceType,
    },
    params: {
        id: {
            field: 'id',
            type: 'number',
            primary: true,
        },
    },
    query: {
        join: {
            skills: {
                eager: true,
            },
        },
    },
})
export class ServiceTypeController implements CrudController<ServiceType> {
    constructor(public service: ServiceTypeService) {}
}
