import { ApiProperty } from '@nestjs/swagger';

export class SendToAllInput {
    @ApiProperty({
        default: 300,
        description: 'The number of seconds to the agent for accepting the task.',
        example: 300,
    })
    requestSeconds: number;
}
