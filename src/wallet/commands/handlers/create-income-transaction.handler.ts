import { ICommandHandler, CommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityNotFoundError } from '@shared/errors';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { GetServiceRequestQuery } from '@service-request/queries/get-service-request.query';
import { IWallet } from '@wallet/entities/interfaces/wallet.interface';
import { WalletTransaction } from '@wallet/entities/wallet-transaction.entity';
import { Wallet } from '@wallet/entities/wallet.entity';
import { CreateIncomeTransactionCommand } from '../create-income-transaction.command';

@CommandHandler(CreateIncomeTransactionCommand)
export class CreateIncomeTransactionHandler implements ICommandHandler<CreateIncomeTransactionCommand> {
    constructor(
        private readonly queryBus: QueryBus,
        @InjectRepository(Wallet) private readonly walletRepository: Repository<Wallet>,
        @InjectRepository(WalletTransaction) private readonly walletTransactionRepository: Repository<WalletTransaction>,
    ) {}

    async execute(command: CreateIncomeTransactionCommand): Promise<void> {
        const { serviceRequestId } = command;

        const serviceRequest: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(serviceRequestId));
        if (!serviceRequest) {
            throw new EntityNotFoundError('ServiceRequest', serviceRequestId);
        }
        const wallet: IWallet =
            (await this.walletRepository.findOne({ ownerId: serviceRequest.getServiceProvider().dispatcher.id })) ||
            Wallet.fromOwner(serviceRequest.getServiceProvider().dispatcher.id);
        const walletTransaction = WalletTransaction.forIncome(wallet, serviceRequest);

        await this.walletTransactionRepository.save(walletTransaction);
    }
}
