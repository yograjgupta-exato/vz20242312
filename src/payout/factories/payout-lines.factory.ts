import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { IServiceProvider } from '../../service-provider/interfaces/service-provider.interface';
import { IServiceRequest } from '../../service-request/interfaces/service-request.interface';
import { GetBulkServiceRequestsQuery } from '../../service-request/queries/get-bulk-service-requests.query';
import { WalletTransactionType } from '../../shared/enums/wallet-transaction-type';
import { WalletTransaction } from '../../wallet/entities/wallet-transaction.entity';
import { PayoutLine } from '../entities/payout-line.entity';
import { PayoutLineTypeEnum } from '../enums/payout-line-type.enum';

@Injectable()
export class PayoutLineFactory {
    constructor(private readonly queryBus: QueryBus) {}

    /**
     * Generates payout-lines from a list of wallet-payableTransactions and service-providers. Service-providers
     * as input due to optimization reason (wanted to share with payout-factory)
     * @param payableTransactions
     * @param serviceProviders
     * @returns Promise<PayoutLine[]>
     */
    public async create(payableTransactions: WalletTransaction[], serviceProviders: IServiceProvider[]): Promise<PayoutLine[]> {
        const serviceProviderLookup = this.generateServiceProviderLookup(serviceProviders);
        const walletTransactionLookup = this.generateWalletTransactionLookup(payableTransactions);
        const uniqueServiceRequestIds = new Set<string>();
        payableTransactions.forEach(trx => uniqueServiceRequestIds.add(trx.serviceRequestId));

        const serviceRequests: IServiceRequest[] = await this.queryBus.execute(new GetBulkServiceRequestsQuery([...uniqueServiceRequestIds]));

        const serviceRequestLookup = this.generateServiceRequestLookup(serviceRequests);
        const lines: PayoutLine[] = [];

        lines.push(...this.generateIncomePayoutLines(payableTransactions, serviceProviderLookup, serviceRequestLookup, walletTransactionLookup));
        lines.push(
            ...this.generateRescheduleSurchargePayoutLines(payableTransactions, serviceProviderLookup, serviceRequestLookup, walletTransactionLookup),
        );

        return lines;
    }

    private generateIncomePayoutLines(
        payableTransactions: WalletTransaction[],
        serviceProviderLookup: { [id: string]: IServiceProvider },
        serviceRequestLookup: { [id: string]: IServiceRequest },
        walletTransactionLookup: { [id: string]: WalletTransaction },
    ): PayoutLine[] {
        const lines: PayoutLine[] = [];
        const incomeTransactions = payableTransactions.filter(trx => trx.type === WalletTransactionType.INCOME);
        incomeTransactions.forEach(trx => {
            const sr = serviceRequestLookup[trx.serviceRequestId];
            sr.getCustomerOrder().servicePackages.forEach(sp => {
                const line = new PayoutLine();
                line.serviceRequestId = sr.getId();
                line.consumerPromotionCode = sr.getCustomerOrder().consumerPromotionCode;
                line.consumerPromotionAmount = sr.getCustomerOrder().consumerPromotionAmount;

                line.owner = serviceProviderLookup[sr.getServiceProvider().dispatcher.id];
                line.bank = line.owner.getBankInfo();
                line.itemRefId = sr.getId();
                line.itemDescription = sp.name;
                line.itemSalesAmount = sp.consumerQuotationDiscountedUnitPrice;
                line.amount = sp.serviceProviderQuotationDiscountedUnitPrice;
                line.itemType = PayoutLineTypeEnum.SERVICE_PACKAGE;
                line.ownerVendorId = line.owner.getVendorId();
                line.walletTransactionId = walletTransactionLookup[sr.getId()].id;
                line.payoutId = walletTransactionLookup[sr.getId()].payoutId;

                line.customerName = sr.getCustomerContact().name;
                line.principalGroup = sr.getPrincipalGroup();
                line.consumerQuotationUnitPrice = sp.consumerQuotationUnitPrice;
                line.serviceProviderQuotationUnitPrice = sp.serviceProviderQuotationUnitPrice;

                [...new Array(sp.quantity)].forEach(() => lines.push(line));
            });
        });
        return lines;
    }

    private generateRescheduleSurchargePayoutLines(
        payableTransactions: WalletTransaction[],
        serviceProviderLookup: { [id: string]: IServiceProvider },
        serviceRequestLookup: { [id: string]: IServiceRequest },
        walletTransactionLookup: { [id: string]: WalletTransaction },
    ): PayoutLine[] {
        const lines: PayoutLine[] = [];
        const rescheduleSurchargeCompensationTransactions = payableTransactions.filter(
            trx => trx.type === WalletTransactionType.RESCHEDULE_SURCHARGE_COMPENSATION,
        );

        rescheduleSurchargeCompensationTransactions.forEach(trx => {
            const sr = serviceRequestLookup[trx.serviceRequestId];
            const line = new PayoutLine();
            line.serviceRequestId = sr.getId();
            line.consumerPromotionCode = sr.getCustomerOrder().consumerPromotionCode;
            line.consumerPromotionAmount = sr.getCustomerOrder().consumerPromotionAmount;

            line.owner = serviceProviderLookup[trx.ownerId];
            line.bank = line.owner.getBankInfo();
            line.itemRefId = `Surcharge-${sr.getId()}`;
            line.itemDescription = PayoutLineTypeEnum.RESCHEDULE_SURCHARGE;
            line.itemSalesAmount = sr.getCustomerRescheduleOrder().consumerSurchargeAmount;
            line.amount = trx.amount;
            line.itemType = PayoutLineTypeEnum.RESCHEDULE_SURCHARGE;
            line.ownerVendorId = line.owner.getVendorId();
            line.walletTransactionId = walletTransactionLookup[sr.getId()].id;
            line.payoutId = walletTransactionLookup[sr.getId()].payoutId;

            line.customerName = sr.getCustomerContact().name;
            line.principalGroup = trx.principalGroup;
            lines.push(line);
        });
        return lines;
    }

    private generateServiceProviderLookup(serviceProviders: IServiceProvider[]): { [id: string]: IServiceProvider } {
        return serviceProviders.reduce((lookup, sp) => {
            lookup[sp.getId()] = sp;
            return lookup;
        }, {});
    }

    private generateWalletTransactionLookup(payableTransactions: WalletTransaction[]): { [id: string]: WalletTransaction } {
        return payableTransactions.reduce((lookup, it) => {
            lookup[it.serviceRequestId] = it;
            return lookup;
        }, {});
    }

    private generateServiceRequestLookup(serviceRequests: IServiceRequest[]): { [id: string]: IServiceRequest } {
        return serviceRequests.reduce((lookup, sr) => {
            lookup[sr.getId()] = sr;
            return lookup;
        }, {});
    }
}
