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
import { ServiceProviderType } from '@shared/enums/service-provider-type';
import { EntityNotFoundError, InternalServerError } from '@shared/errors';
import { stripPhoneNumber } from '@shared/utils';
import { ValidateUniquenessOfPrimaryPhoneAndEmailOrThrowQuery } from '../service-provider/queries';
import { ServiceProvider } from '../service-provider/service-provider.entity';
import { ServiceProviderService } from '../service-provider/service-provider.service';
import { UpdateDealerDto, CreateDealerDto } from './dealer.dto';
import { Dealer } from './dealer.entity';

@Injectable()
export class DealerService extends TypeOrmCrudService<Dealer> {
    constructor(
        @InjectRepository(Dealer) private readonly repository: Repository<Dealer>,
        private commandBus: CommandBus,
        private queryBus: QueryBus,
        private serviceProviderService: ServiceProviderService,
    ) {
        super(repository);
    }

    async createOne(req: CrudRequest, dto: CreateDealerDto): Promise<Dealer> {
        dto.profile.phoneNumber = stripPhoneNumber(dto.profile.phoneNumber);
        dto.profile.emailAddress = dto.profile.emailAddress.toLowerCase();
        await this.queryBus.execute(new ValidateUniquenessOfPrimaryPhoneAndEmailOrThrowQuery(dto.profile.phoneNumber, dto.profile.emailAddress));

        dto.profile.type = ServiceProviderType.DEALER;
        dto.profile.skillEntitlement = ServiceProvider.calculateSkillEntitlement(dto.profile.skills);
        if (dto?.profile?.bank?.bankName) {
            dto.profile.bank.bankDisplayName = BankDisplayNames[dto.profile?.bank.bankName] ?? null;
            dto.profile.bank.swiftCode = BankSwiftCodes[dto?.profile?.bank?.bankName] ?? null;
        }
        // Note: To workaround Cyclic dependency error
        // https://github.com/typeorm/typeorm/issues/4526#issuecomment-559886529
        const insertResult = await this.repository
            .createQueryBuilder()
            .insert()
            .into(ServiceProvider)
            .values(dto.profile)
            .execute();

        if (!insertResult.identifiers || insertResult.identifiers.length === 0) {
            throw new InternalServerError();
        }

        dto.id = insertResult.identifiers[0].id;
        const user = this.repository.create(dto);
        const result = await this.repository.save(user);

        await this.commandBus.execute(
            new CreateUserLoginCommand({
                userId: result.profile.id,
                userType: UserType.PROVIDER,
                username: dto.profile.phoneNumber,
                secondaryUsername: dto.profile.emailAddress,
                password: dto.password,
                groups: [ServiceProviderType.DEALER],
            }),
        );

        return result;
    }

    async replaceOne(req: CrudRequest, dto: UpdateDealerDto): Promise<Dealer> {
        dto.profile.phoneNumber = stripPhoneNumber(dto.profile.phoneNumber);
        dto.profile.emailAddress = dto.profile.emailAddress.toLowerCase();
        dto.profile.skillEntitlement = ServiceProvider.calculateSkillEntitlement(dto.profile.skills);
        if (dto?.profile?.bank?.bankName) {
            dto.profile.bank.bankDisplayName = BankDisplayNames[dto.profile?.bank.bankName] ?? null;
            dto.profile.bank.swiftCode = BankSwiftCodes[dto?.profile?.bank?.bankName] ?? null;
        }
        await this.queryBus.execute(
            new ValidateUniquenessOfPrimaryPhoneAndEmailOrThrowQuery(dto.profile.phoneNumber, dto.profile.emailAddress, dto.profile.id),
        );

        const user = this.repository.create(dto);
        const result = await this.repository.save(user);

        await this.commandBus.execute(
            new UpdateUserLoginCommand({
                userId: result.id,
                userType: UserType.PROVIDER,
                username: dto.profile.phoneNumber,
                secondaryUsername: dto.profile.emailAddress,
                password: dto.password,
                groups: [ServiceProviderType.DEALER],
            }),
        );

        return result;
    }

    async softDeleteOne(id: string) {
        const dealer = await this.repository.findOne(id);
        if (!dealer) {
            throw new EntityNotFoundError('Dealer', id);
        }

        await this.repository.softDelete({ id });

        // Assume serviceProviderService.softDeleteOne will handle user login deletion
        await this.serviceProviderService.softDeleteOne(id);

        return dealer;
    }
}
