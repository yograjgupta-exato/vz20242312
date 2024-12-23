import { Test, TestingModule } from '@nestjs/testing';
import { AppConfigModule } from '../shared/config';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
    let service: DashboardService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppConfigModule],
            providers: [DashboardService],
        }).compile();

        service = module.get<DashboardService>(DashboardService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
