import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './promotion.entity';

@Injectable()
export class AdminPromotionService extends TypeOrmCrudService<Promotion> {
    constructor(@InjectRepository(Promotion) public repository: Repository<Promotion>) {
        super(repository);
    }
}
