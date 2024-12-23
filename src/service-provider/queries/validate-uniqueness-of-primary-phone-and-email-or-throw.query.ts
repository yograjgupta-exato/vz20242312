export class ValidateUniquenessOfPrimaryPhoneAndEmailOrThrowQuery {
    constructor(public readonly phoneNumber: string, public readonly emailAddress: string, public readonly ignoreServiceProviderId?: string) {}
}
