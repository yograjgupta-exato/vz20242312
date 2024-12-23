import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { ConsumerDisplayGroup } from './entities/consumer-display-group.entity';

@Injectable()
export class ConsumerDisplayGroupService extends TypeOrmCrudService<ConsumerDisplayGroup> {
    constructor(@InjectRepository(ConsumerDisplayGroup) public repository: Repository<ConsumerDisplayGroup>) {
        super(repository);
    }
}
