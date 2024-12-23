import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { MockRepository } from '@shared/mocks/mock-repository';
import { Skill } from './skill.entity';
import { SkillService } from './skill.service';

describe('SkillService', () => {
    let service: SkillService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [TypeOrmModule.forFeature([Skill])],
            providers: [SkillService],
        })
            .overrideProvider(getRepositoryToken(Skill))
            .useValue(new MockRepository<Skill>())
            .compile();

        service = module.get<SkillService>(SkillService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
