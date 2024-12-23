import { ICommandHandler, CommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityNotFoundError } from '@shared/errors';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { GetServiceRequestQuery } from '@service-request/queries/get-service-request.query';
import { IWallet } from '@wallet/entities/interfaces/wallet.interface';
import { WalletTransaction } from '@wallet/entities/wallet-transaction.entity';
import { Wallet } from '@wallet/entities/wallet.entity';
import { PaymentPurposeCode } from '../../../shared/enums/payment-purpose-code';
import { WalletTransactionType } from '../../../shared/enums/wallet-transaction-type';
import { CreateRescheduleSurchargeCompensationTransactionCommand } from '../create-reschedule-surcharge-compensation-transaction.command';

@CommandHandler(CreateRescheduleSurchargeCompensationTransactionCommand)
export class CreateRescheduleSurchargeCompensationTransactionHandler
    implements ICommandHandler<CreateRescheduleSurchargeCompensationTransactionCommand> {
    constructor(
        private readonly queryBus: QueryBus,
        @InjectRepository(Wallet) private readonly walletRepository: Repository<Wallet>,
        @InjectRepository(WalletTransaction) private readonly walletTransactionRepository: Repository<WalletTransaction>,
    ) {}

    async execute(command: CreateRescheduleSurchargeCompensationTransactionCommand): Promise<void> {
        const { serviceRequestId } = command;
        const serviceRequest: IServiceRequest = await this.queryBus.execute(new GetServiceRequestQuery(serviceRequestId));
        if (!serviceRequest) {
            throw new EntityNotFoundError('ServiceRequest', serviceRequestId);
        }

        if (
            !serviceRequest.hasBeenRescheduledOnce() ||
            !serviceRequest.requiresCustomerPayment(PaymentPurposeCode.EC_RESCHEDULE_SURCHARGE) ||
            !serviceRequest.hasCustomerPaid(PaymentPurposeCode.EC_RESCHEDULE_SURCHARGE)
        ) {
            return;
        }

        const ownerId = serviceRequest.getCustomerRescheduleOrder().impactedServiceProviderId;

        const wallet: IWallet = (await this.walletRepository.findOne({ ownerId })) || Wallet.fromOwner(ownerId);

        const compensatedSurcharge = await this.walletTransactionRepository.findOne({
            where: { ownerId, type: WalletTransactionType.RESCHEDULE_SURCHARGE_COMPENSATION, source: { id: serviceRequest.getId() } },
        });

        // note(roy): ensure idempotent
        if (compensatedSurcharge) {
            return;
        }

        const walletTransaction = WalletTransaction.forRescheduleSurchargeCompensation(wallet, serviceRequest);
        await this.walletTransactionRepository.save(walletTransaction);
    }
}
