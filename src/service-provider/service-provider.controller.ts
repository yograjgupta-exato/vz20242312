import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CrudController, Crud, Override, ParsedRequest, CrudRequest, ParsedBody } from '@nestjsx/crud';
import { PROTECTED_ROUTES } from '@shared/crud';
import { CurrentUser, CustomApiHeaders } from '@shared/decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserStatus } from '../shared/enums';
import { UnauthorizedError } from '../shared/errors';
import { CreateServiceProviderDto, UpdateServiceProviderDto } from './service-provider.dto';
import { ServiceProvider } from './service-provider.entity';
import { ServiceProviderService } from './service-provider.service';

@ApiTags('service-provider')
@CustomApiHeaders()
@Controller('providers')
@Crud({
    model: {
        type: ServiceProvider,
    },
    routes: {
        ...PROTECTED_ROUTES,
        getManyBase: {
            decorators: [ApiBearerAuth(), UseGuards(JwtAuthGuard)],
        },
    },
    query: {
        join: {
            skills: {
                eager: false,
            },
            dealer: {
                eager: false,
            },
            serviceAreas: {
                eager: true,
            },
        },
    },
})
export class ServiceProviderController implements CrudController<ServiceProvider> {
    constructor(public service: ServiceProviderService) {}

    @Override()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    createOne(@ParsedRequest() req: CrudRequest, @ParsedBody() dto: CreateServiceProviderDto) {
        return this.service.createOne(req, dto);
    }

    @Override()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    replaceOne(@ParsedRequest() req: CrudRequest, @ParsedBody() dto: UpdateServiceProviderDto) {
        return this.service.replaceOne(req, dto);
    }

    @Override()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    deleteOne(@ParsedRequest() req: CrudRequest): Promise<void | ServiceProvider> {
        return this.service.softDeleteOne(req.parsed.paramsFilter[0].value);
    }

    @Get('current')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async getCurrentUserProfile(@CurrentUser('sub') id: string): Promise<ServiceProvider> {
        const serviceProvider = await this.service.findOne(id);
        if (serviceProvider.generalStatus === UserStatus.BANNED) {
            throw new UnauthorizedError();
        }
        return serviceProvider;
    }
}
