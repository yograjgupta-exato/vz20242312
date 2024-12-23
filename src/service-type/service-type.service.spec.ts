import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { MockRepository } from '@shared/mocks/mock-repository';
import { ServiceType } from './service-type.entity';
import { ServiceTypeService } from './service-type.service';

describe('ServiceTypeService', () => {
  let service: ServiceTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
        imports: [TypeOrmModule.forFeature([ServiceType])],
        providers: [ServiceTypeService],
    })
        .overrideProvider(getRepositoryToken(ServiceType))
        .useValue(new MockRepository<ServiceType>())
        .compile();

    service = module.get<ServiceTypeService>(ServiceTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
