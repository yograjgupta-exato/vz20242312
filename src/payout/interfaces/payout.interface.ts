import { Tenant } from '@shared/enums';
import { IServiceProvider } from '@service-provider/interfaces/service-provider.interface';

export interface IPayout {
    getId(): string;
    getOwner(): IServiceProvider;
    getPrincipalGroup(): Tenant;
    getAmount(): number;
    paymentFileUploaded(): void;
    markAsPaid(): void;
    hasPaid(): boolean;
    hasPaymentFullyProcessed(): boolean;
}
