import { ApiProperty } from '@nestjs/swagger';
import { ServiceActionTypeEnum } from '@service-request/enums/service-action-type.enum';

export class NextServiceActionTypeDto {
    @ApiProperty({
        description: 'The code of next service action type.',
    })
    code: ServiceActionTypeEnum;

    @ApiProperty({
        description: 'A human-friendly unique string for the Code',
    })
    name: string;
}