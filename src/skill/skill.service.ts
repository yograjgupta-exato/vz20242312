import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Skill } from './skill.entity';

@Injectable()
export class SkillService extends TypeOrmCrudService<Skill> {
    constructor(@InjectRepository(Skill) public repository: Repository<Skill>) {
        super(repository);
    }
}
