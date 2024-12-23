import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Refund } from './refund.entity';

@Injectable()
export class RefundService extends TypeOrmCrudService<Refund> {
    constructor(@InjectRepository(Refund) public repository: Repository<Refund>) {
        super(repository);
    }

    async create(dto: DeepPartial<Refund>): Promise<Refund> {
        return this.repository.save(dto);
    }
}
