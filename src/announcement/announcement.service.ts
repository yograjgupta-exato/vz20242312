import { Injectable, Inject } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { CrudRequest } from '@nestjsx/crud';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { OneSignalSegmentType } from '@shared/enums/one-signal-segment-type';
import { Announcement } from './annoucement.entity';
import { SendAnnouncementCommand } from './commands/send-announcement.command';

@Injectable()
export class AnnouncementService extends TypeOrmCrudService<Announcement> {
    constructor(
        @InjectRepository(Announcement)
        private readonly repository: Repository<Announcement>,
        private commandBus: CommandBus,
    ) {
        super(repository);
    }

    async createOne(req: CrudRequest, dto: Announcement): Promise<Announcement> {
        const announcement = this.repository.create(dto);
        const result = await this.repository.save(announcement);

        await this.commandBus.execute(new SendAnnouncementCommand(result.message, result, [OneSignalSegmentType.SubscribedUser]));

        return result;
    }
}
