import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { AutoAssignmentSettingInput } from './dto/auto-assignment-setting.input';
import { AutoAssignmentSetting } from './entities/auto-assignment-setting.entity';

@Injectable()
export class AutoAssignmentSettingService extends TypeOrmCrudService<AutoAssignmentSetting> {
    constructor(@InjectRepository(AutoAssignmentSetting) public repository: Repository<AutoAssignmentSetting>) {
        super(repository);
    }

    async create(input: AutoAssignmentSettingInput): Promise<AutoAssignmentSetting> {
        const as = new AutoAssignmentSetting();
        as.batchWise = input.batchWise;
        as.sendToAll = input.sendToAll;
        return this.repository.save(as);
    }
}
