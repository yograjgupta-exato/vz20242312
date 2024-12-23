import { CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { MockRepository } from '@shared/mocks/mock-repository';
import { ServiceProvider } from '../service-provider/service-provider.entity';
import { ServiceProviderModule } from '../service-provider/service-provider.module';
import { ServiceProviderService } from '../service-provider/service-provider.service';
import { AppConfigModule } from '../shared/config';
import { SharedModule } from '../shared/shared.module';
import { Dealer } from './dealer.entity';
import { DealerService } from './dealer.service';

describe('DealerService', () => {
    let service: DealerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DealerService],
            imports: [SharedModule, AppConfigModule, TypeOrmModule.forFeature([Dealer]), ServiceProviderModule, CqrsModule],
        })
            .overrideProvider(getRepositoryToken(Dealer))
            .useValue(new MockRepository<Dealer>())
            .overrideProvider(ServiceProviderService)
            .useValue({})
            .overrideProvider(getRepositoryToken(ServiceProvider))
            .useValue(new MockRepository<ServiceProvider>())
            .compile();

        service = module.get<DealerService>(DealerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
