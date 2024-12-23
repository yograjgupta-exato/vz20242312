import { Announcement } from '../annoucement.entity';

export class SendAnnouncementCommand {
    constructor(public readonly message: string, public readonly input: Announcement, public readonly segments: string[]) {}
}
