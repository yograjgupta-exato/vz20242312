import { GetServiceProvidersByIdsHandler } from './get-payable-service-providers.handler';
import { GetServiceProviderHandler } from './get-service-provider.handler';
import { ScanCandidatesHandler } from './scan-candidates.handler';
import { ValidateUniquenessOfPrimaryPhoneAndEmailOrThrowHandler } from './validate-uniqueness-of-primary-phone-and-email-or-throw.handler';

export const QueryHandlers = [
    GetServiceProviderHandler,
    GetServiceProvidersByIdsHandler,
    ScanCandidatesHandler,
    ValidateUniquenessOfPrimaryPhoneAndEmailOrThrowHandler,
];
