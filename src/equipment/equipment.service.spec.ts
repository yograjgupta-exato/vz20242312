import { CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { MockRepository } from '@shared/mocks/mock-repository';
import { Equipment } from './equipment.entity';
import { EquipmentService } from './equipment.service';

describe('EquipmentService', () => {
    let service: EquipmentService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [CqrsModule, TypeOrmModule.forFeature([Equipment])],
            providers: [EquipmentService],
        })
            .overrideProvider(getRepositoryToken(Equipment))
            .useValue(new MockRepository<Equipment>())
            .compile();

        service = module.get<EquipmentService>(EquipmentService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
