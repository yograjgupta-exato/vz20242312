import { ApiProperty } from '@nestjs/swagger';

export class OneByOneInput {
    @ApiProperty({
        default: 90,
        description: 'The number of seconds to the agent for accepting the task.',
        example: 90,
    })
    requestSeconds: number;

    @ApiProperty({
        default: 3,
        description: 'The number of retries.',
        example: 3,
        maximum: 8,
    })
    retries: number;
}
