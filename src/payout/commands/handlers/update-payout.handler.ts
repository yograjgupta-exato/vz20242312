import { BadRequestException } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReleaseBalanceForPayoutCommand } from '../../../wallet/commands/release-balance-for-payout.command';
import { Payout } from '../../entities/payout.entity';
import { PayoutStatusEnum } from '../../enums/payout-status.enum';
import { UpdatePayoutCommand } from '../update-payout.command';

@CommandHandler(UpdatePayoutCommand)
export class UpdatePayoutHandler implements ICommandHandler<UpdatePayoutCommand> {
    constructor(@InjectRepository(Payout) private readonly repository: Repository<Payout>, private readonly commandBus: CommandBus) {}
    async execute(command: UpdatePayoutCommand): Promise<void> {
        const { id } = command;
        const payout = await this.repository.findOne({ id });
        if (payout) {
            if (payout.status !== PayoutStatusEnum.IN_TRANSIT) {
                throw new BadRequestException('Only payout status in transit allowed to be updated to other status.');
            }
            await this.repository.update(id, {
                ...command.input,
            });

            await this.commandBus.execute(new ReleaseBalanceForPayoutCommand(payout.getId()));
        }
    }
}
