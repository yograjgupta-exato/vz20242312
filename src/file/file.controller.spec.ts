import { Test, TestingModule } from '@nestjs/testing';
import { FileController } from './file.controller';
import { FileService } from './file.service';

describe('File Controller', () => {
    let controller: FileController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FileController],
            providers: [FileService],
        })
            .overrideProvider(FileService)
            .useValue({})
            .compile();

        controller = module.get<FileController>(FileController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
