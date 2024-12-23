import { Repository, EntityRepository, Not, Raw } from 'typeorm';
import { GeneralStatus, ServiceProviderType, UserStatus } from '@shared/enums';
import { IServiceProvider } from '@service-provider/interfaces/service-provider.interface';
import { ServiceProvider } from '@service-provider/service-provider.entity';
import { IServiceArea } from 'service-area/entities/interfaces/service-area.interface';

@EntityRepository(ServiceProvider)
export class ServiceProviderRepository extends Repository<ServiceProvider> {
    async findOnDutyDealersOrIndependentsWithinCoverage(
        serviceAreas: IServiceArea[],
        excludeServiceProviderIds: string[],
        serviceRequestEntitlement: number,
        limit = 9999,
    ): Promise<IServiceProvider[]> {
        const query = this.createQueryBuilder('provider')
            .leftJoinAndSelect('provider.serviceAreas', 'area')
            .select('provider')
            .andWhere('provider.general_status = :status', { status: GeneralStatus.ACTIVE })
            // .andWhere('provider.is_on_duty = :isOnDuty', { isOnDuty: true })
            .andWhere('provider.type <> :providerType', { providerType: ServiceProviderType.WORKER })
            .andWhere('(provider.skillEntitlement & :serviceRequestEntitlement) > 0', { serviceRequestEntitlement });

        if (serviceAreas.length) {
            query.andWhere('area.id IN (:...ids)', { ids: serviceAreas.map(sa => sa.getId()) });
        }

        if (excludeServiceProviderIds.length) {
            query.andWhere('provider.id NOT IN (:...ids)', { ids: excludeServiceProviderIds });
        }

        return query.take(limit).getMany();
    }

    async findOnDutyDealerOrIndependents(serviceRequestEntitlement: number, onlyOnDutyProviders = true): Promise<IServiceProvider[]> {
        const scanningFilter = {
            type: Not(ServiceProviderType.WORKER),
            generalStatus: UserStatus.ACTIVE,
            skillEntitlement: Raw(alias => `(${alias} & ${serviceRequestEntitlement}) >= 0`),
            isOnDuty: true,
        };

        if (!onlyOnDutyProviders) {
            delete scanningFilter.isOnDuty;
        }

        return await this.find({
            where: scanningFilter,
        });
    }

    async countMatchingPrimaryPhoneNumbers(phoneNumber: string, idToIgnored?: string) {
        return this.count({
            where: {
                phoneNumber,
                ...(idToIgnored && { id: Not(idToIgnored) }),
            },
        });
    }

    async countMatchingEmails(emailAddress: string, idToIgnored?: string) {
        return this.count({
            where: {
                emailAddress,
                ...(idToIgnored && { id: Not(idToIgnored) }),
            },
        });
    }
}
