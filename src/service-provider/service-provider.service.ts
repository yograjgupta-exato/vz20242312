import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { CrudRequest } from '@nestjsx/crud';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { CreateUserLoginCommand } from '@cqrs/commands/create-user-login.command';
import { UpdateUserLoginCommand } from '@cqrs/commands/update-user-login.command';
import { BankDisplayNames, BankSwiftCodes } from '@shared/constants';
import { UserType } from '@shared/enums';
import { stripPhoneNumber } from '@shared/utils';
import { DeleteUserLoginCommand } from '../cqrs/commands/delete-user-login.command';
import { ServiceProviderType } from '../shared/enums/service-provider-type';
import { EntityNotFoundError } from '../shared/errors';
import { LatLngDto } from './dto/lat-lng.dto';
import { ValidateUniquenessOfPrimaryPhoneAndEmailOrThrowQuery } from './queries/validate-uniqueness-of-primary-phone-and-email-or-throw.query';
import { CreateServiceProviderDto, UpdateServiceProviderDto } from './service-provider.dto';
import { ServiceProvider } from './service-provider.entity';

@Injectable()
export class ServiceProviderService extends TypeOrmCrudService<ServiceProvider> {
    constructor(
        @InjectRepository(ServiceProvider) private readonly repository: Repository<ServiceProvider>,
        private commandBus: CommandBus,
        private queryBus: QueryBus,
    ) {
        super(repository);
    }

    async createOne(req: CrudRequest, dto: CreateServiceProviderDto): Promise<ServiceProvider> {
        dto.phoneNumber = stripPhoneNumber(dto.phoneNumber);
        dto.emailAddress = dto.emailAddress.toLowerCase();
        if (dto.emergencyContact) {
            dto.emergencyContact.number = stripPhoneNumber(dto.emergencyContact.number);
        }
        if (dto?.bank?.bankName) {
            dto.bank.bankDisplayName = BankDisplayNames[dto.bank.bankName] ?? null;
            dto.bank.swiftCode = BankSwiftCodes[dto.bank.bankName] ?? null;
        }
        dto.skillEntitlement = ServiceProvider.calculateSkillEntitlement(dto.skills);

        await this.queryBus.execute(new ValidateUniquenessOfPrimaryPhoneAndEmailOrThrowQuery(dto.phoneNumber, dto.emailAddress));

        const user = this.repository.create(dto);
        user.type = dto.dealerId || dto.dealer?.id ? ServiceProviderType.WORKER : ServiceProviderType.INDEPENDENT;

        const result = await this.repository.save(user);

        await this.commandBus.execute(
            new CreateUserLoginCommand({
                userId: result.id,
                userType: UserType.PROVIDER,
                username: dto.phoneNumber,
                secondaryUsername: dto.emailAddress,
                password: dto.password,
                groups: [user.type],
            }),
        );

        return result;
    }

    async replaceOne(req: CrudRequest, dto: UpdateServiceProviderDto): Promise<ServiceProvider> {
        dto.phoneNumber = stripPhoneNumber(dto.phoneNumber);
        dto.emailAddress = dto.emailAddress.toLowerCase();
        if (dto.emergencyContact) {
            dto.emergencyContact.number = stripPhoneNumber(dto.emergencyContact.number);
        }
        if (dto?.bank?.bankName) {
            dto.bank.bankDisplayName = BankDisplayNames[dto.bank.bankName] ?? null;
            dto.bank.swiftCode = BankSwiftCodes[dto.bank.bankName] ?? null;
        }
        dto.skillEntitlement = ServiceProvider.calculateSkillEntitlement(dto.skills);

        await this.queryBus.execute(new ValidateUniquenessOfPrimaryPhoneAndEmailOrThrowQuery(dto.phoneNumber, dto.emailAddress, dto.id));

        const user = this.repository.create(dto);
        user.type = dto.dealerId || dto.dealer?.id ? ServiceProviderType.WORKER : ServiceProviderType.INDEPENDENT;

        const result = await this.repository.save(user);

        await this.commandBus.execute(
            new UpdateUserLoginCommand({
                userId: result.id,
                userType: UserType.PROVIDER,
                username: dto.phoneNumber,
                secondaryUsername: dto.emailAddress,
                password: dto.password,
                groups: [user.type],
            }),
        );

        return result;
    }

    async updateLocation(providerId: string, input: LatLngDto): Promise<LatLngDto> {
        await this.repository.update(
            {
                id: providerId,
            },
            { latitude: input.latitude, longitude: input.longitude },
        );

        return input;
    }

    async onDuty(providerId: string, input: LatLngDto): Promise<boolean> {
        await this.repository.update(
            {
                id: providerId,
            },
            { isOnDuty: true, latitude: input.latitude, longitude: input.longitude },
        );

        return true;
    }

    async offDuty(providerId: string, input: LatLngDto): Promise<boolean> {
        await this.repository.update(
            {
                id: providerId,
            },
            { isOnDuty: false },
        );

        // refactor(roy): was rushing..
        if (input.latitude && input.longitude) {
            await this.repository.update(
                {
                    id: providerId,
                },
                { latitude: input.latitude, longitude: input.longitude },
            );
        }

        return true;
    }

    async softDeleteOne(id: string) {
        const serviceProvider = await this.repository.findOne(id);
        if (!serviceProvider) {
            throw new EntityNotFoundError('ServiceProvider', id);
        }

        await this.repository.softDelete({ id });
        await this.commandBus.execute(
            new DeleteUserLoginCommand({
                userId: serviceProvider.id,
                userType: UserType.PROVIDER,
            }),
        );
    }
}
