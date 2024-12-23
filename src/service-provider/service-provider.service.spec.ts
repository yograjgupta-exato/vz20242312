import { CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '@shared/config';
import { MockRepository } from '@shared/mocks/mock-repository';
import { SharedModule } from '@shared/shared.module';
import { ServiceProvider } from './service-provider.entity';
import { ServiceProviderService } from './service-provider.service';

describe('ServiceProviderService', () => {
    let service: ServiceProviderService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [SharedModule, AppConfigModule, TypeOrmModule.forFeature([ServiceProvider]), CqrsModule],
            providers: [ServiceProviderService],
        })
            .overrideProvider(getRepositoryToken(ServiceProvider))
            .useValue(new MockRepository<ServiceProvider>())
            .compile();

        service = module.get<ServiceProviderService>(ServiceProviderService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
