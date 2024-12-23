import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Crud, CrudController, Override, ParsedRequest, ParsedBody, CrudRequest } from '@nestjsx/crud';
import { CustomApiHeaders } from '@shared/decorators';
import { Announcement } from './annoucement.entity';
import { AnnouncementService } from './announcement.service';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';

@ApiTags('announcement')
@CustomApiHeaders()
@Controller('announcements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Crud({
    model: {
        type: Announcement,
    },
    query: {
        sort: [{ field: 'createdAt', order: 'DESC' }],
    },
    params: {
        id: {
            field: 'id',
            type: 'string',
            primary: true,
        },
    },
    routes: {
        exclude: ['createManyBase'],
    },
})
export class AnnouncementController implements CrudController<Announcement> {
    constructor(public service: AnnouncementService) {}

    @Override()
    createOne(@ParsedRequest() req: CrudRequest, @ParsedBody() dto: Announcement) {
        return this.service.createOne(req, dto);
    }
}
