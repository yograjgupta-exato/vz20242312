import { Test, TestingModule } from '@nestjs/testing';
import { AppConfigModule } from '@shared/config';
import { FireMobileApi } from './fire-mobile.api';
import { SmsService } from './sms.service';

describe('SmsService', () => {
    let service: SmsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SmsService, FireMobileApi],
            imports: [AppConfigModule],
        }).compile();

        service = module.get<SmsService>(SmsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
