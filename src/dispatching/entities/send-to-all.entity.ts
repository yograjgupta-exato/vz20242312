import { ApiProperty } from '@nestjs/swagger';

export class SendToAll {
    @ApiProperty({
        default: 300,
        description: 'the number of seconds to the agent for accepting the task.',
        example: 300,
    })
    requestSeconds: number;
}
