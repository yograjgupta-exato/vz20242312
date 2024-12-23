import { IsNotEmpty, IsDefined } from 'class-validator';

export class GetPresignedURLDto {
    @IsNotEmpty()
    @IsDefined({ always: true })
    attachmentType: string;
    @IsNotEmpty()
    name: string;
    referenceId?: string
}

export class PutPresignedURLDto {
    @IsNotEmpty()
    @IsDefined({ always: true })
    attachmentType: string;
    @IsNotEmpty()
    name: string;
    referenceId?: string
}
