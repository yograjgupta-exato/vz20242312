import { DeleteUserLoginDto } from '../../auth/auth.dto';

export class DeleteUserLoginCommand {
    constructor(public readonly input: DeleteUserLoginDto) {}
}
