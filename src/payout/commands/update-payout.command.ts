import { UpdatePayoutDto } from '../dtos/update-payout.dto';

export class UpdatePayoutCommand {
    constructor(public readonly id: string, public readonly input: UpdatePayoutDto) {}
}
