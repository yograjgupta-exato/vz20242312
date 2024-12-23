import { Controller, Body, Query, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CustomApiHeaders } from '@shared/decorators';
import { GetPresignedURLDto, PutPresignedURLDto } from './file.dto';
import { FileService } from './file.service';

@ApiTags('file')
@CustomApiHeaders()
@Controller('files')
export class FileController {
    constructor(private readonly fileService: FileService) { }

    @Get('upload-signed-url')
    async uploadLink(@Query() input: PutPresignedURLDto): Promise<{ url: string; key: string }> {
        return this.fileService.getSignedUrl(input.attachmentType, input.name, input.referenceId, 'putObject');
    }

    @Get('get-signed-url')
    async viewLink(@Body() input: GetPresignedURLDto): Promise<{ url: string; key: string }> {
        return this.fileService.getSignedUrl(input.attachmentType, input.name, input.referenceId, 'getObject');
    }
}
