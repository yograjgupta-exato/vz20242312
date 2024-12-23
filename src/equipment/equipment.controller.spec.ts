import { CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { MockRepository } from '@shared/mocks/mock-repository';
import { EquipmentController } from './equipment.controller';
import { Equipment } from './equipment.entity';
import { EquipmentService } from './equipment.service';

describe('Equipment Controller', () => {
    let controller: EquipmentController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [CqrsModule, TypeOrmModule.forFeature([Equipment])],
            controllers: [EquipmentController],
            providers: [EquipmentService],
        })
            .overrideProvider(getRepositoryToken(Equipment))
            .useValue(new MockRepository<Equipment>())
            .compile();

        controller = module.get<EquipmentController>(EquipmentController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
