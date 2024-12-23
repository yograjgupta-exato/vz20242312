import { Bank } from '@service-provider/service-provider.entity';
import { ServiceProviderDto } from 'service-provider/service-provider.dto';

export interface IServiceProvider {
    isDealer(): boolean;
    isIndependent(): boolean;
    isWorker(): boolean;
    getId(): string;
    getName(): string;
    getPhone(): string;
    getBankInfo(): Bank;
    getProfilePicture(): string;
    getAddressString(delimiter?: string): string;
    getEmailAddress(): string;
    getVendorId(): string;
    toDto(): ServiceProviderDto;
}
