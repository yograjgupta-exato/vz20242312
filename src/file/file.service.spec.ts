import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppConfigService } from '@shared/config';
import { FileService } from './file.service';

describe('FileService', () => {
    let service: FileService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ConfigModule.forRoot({})],
            providers: [FileService, AppConfigService],
        }).compile();

        service = module.get<FileService>(FileService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
