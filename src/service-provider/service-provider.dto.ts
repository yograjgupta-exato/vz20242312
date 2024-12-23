import { Length, IsOptional } from 'class-validator';
import { ServiceProvider } from './service-provider.entity';

export class CreateServiceProviderDto extends ServiceProvider {
    @Length(5)
    password: string;
}

export class UpdateServiceProviderDto extends ServiceProvider {
    @IsOptional()
    @Length(5)
    password?: string;
}

export class ServiceProviderDto extends ServiceProvider {}
