import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { getCustomRepository } from 'typeorm';
import { EmailAddressAlreadyInUsedError, PrimaryPhoneNumberAlreadyInUsedError } from '@shared/errors';
import { ServiceProviderRepository } from '@service-provider/repository/service-provider.repository';
import { ValidateUniquenessOfPrimaryPhoneAndEmailOrThrowQuery } from '../validate-uniqueness-of-primary-phone-and-email-or-throw.query';

@QueryHandler(ValidateUniquenessOfPrimaryPhoneAndEmailOrThrowQuery)
export class ValidateUniquenessOfPrimaryPhoneAndEmailOrThrowHandler implements IQueryHandler<ValidateUniquenessOfPrimaryPhoneAndEmailOrThrowQuery> {
    async execute(query: ValidateUniquenessOfPrimaryPhoneAndEmailOrThrowQuery): Promise<boolean> {
        const { emailAddress, phoneNumber, ignoreServiceProviderId } = query;
        const serviceProviderRepository = getCustomRepository(ServiceProviderRepository);

        const matchingEmailsCount = await serviceProviderRepository.countMatchingEmails(emailAddress, ignoreServiceProviderId);
        if (matchingEmailsCount > 0) {
            throw new EmailAddressAlreadyInUsedError(emailAddress);
        }

        const matchingPhoneNumbersCount = await serviceProviderRepository.countMatchingPrimaryPhoneNumbers(phoneNumber, ignoreServiceProviderId);
        if (matchingPhoneNumbersCount > 0) {
            throw new PrimaryPhoneNumberAlreadyInUsedError(phoneNumber);
        }

        return true;
    }
}
