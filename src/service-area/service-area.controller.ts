import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@nestjsx/crud';
import { LatLngDto } from '@service-provider/dto/lat-lng.dto';
import { ServiceArea } from './entities/service-area.entity';
import { IsWithinCoverageQuery } from './queries/is-within-coverage.query';
import { ServiceAreaService } from './service-area.service';

@ApiTags('service-area')
@Controller('service-areas')
@ApiBearerAuth()
@Crud({
    model: {
        type: ServiceArea,
    },
    params: {
        id: {
            field: 'id',
            type: 'string',
            primary: true,
        },
    },
})
export class ServiceAreaController implements CrudController<ServiceArea> {
    constructor(private readonly queryBus: QueryBus, public service: ServiceAreaService) {}

    @Get('coverageValidity')
    async isWithinCoverage(@Query() latLng: LatLngDto): Promise<{ validity: boolean }> {
        return { validity: await this.queryBus.execute(new IsWithinCoverageQuery(latLng)) };
    }
}
