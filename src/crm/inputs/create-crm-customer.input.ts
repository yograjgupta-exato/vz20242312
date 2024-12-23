import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { StateCode } from '../crm.enum';
import { CRMCustomerDto, CRMCustomerMappingKeys } from '../dtos/crm-customer.dto';
import { RegisterCrmWarrantyEquipmentsInput } from './register-crm-warranty-equipments.input';

export class CreateCRMCustomerInput extends OmitType(CRMCustomerDto, [
    CRMCustomerMappingKeys.CustomerID,
    CRMCustomerMappingKeys.FormattedName,
    CRMCustomerMappingKeys.RoleCode,
]) {
    @ApiProperty({
        description: 'The region of the address, such as the province, state, or district',
        example: StateCode.SEL,
        nullable: false,
        type: 'enum',
    })
    @IsNotEmpty()
    @Transform(state => {
        const reverseMode = new Map<string, StateCode>();
        Object.keys(StateCode).forEach((mode: StateCode) => {
            const modeValue: string = StateCode[mode];
            reverseMode.set(modeValue, mode);
        });
        return reverseMode.get(state);
    })
    addressState: string; // need to test test code first or text first.

    static fromServiceRequest(serviceRequest: IServiceRequest): CreateCRMCustomerInput {
        const contact = serviceRequest.getCustomerContact();
        const input = new CreateCRMCustomerInput();
        input.email = contact.email;
        input.phone = contact.phone;
        input[CRMCustomerMappingKeys.RoleCode] = 'CRM000';

        const matches = contact?.name?.match(/(M(r|rs|s)\.?)\s([a-zA-Z0-9_ ]*)/);

        if (matches) {
            const [, title, , fullName] = matches;
            input.firstName = title;
            input.lastName = fullName;
        } else {
            input.lastName = contact.name;
        }

        return input;
    }

    static fromCRMWarrantyRegistration(crmWarrantyRegistrationInput: RegisterCrmWarrantyEquipmentsInput): CreateCRMCustomerInput {
        const input = new CreateCRMCustomerInput();
        input.firstName = crmWarrantyRegistrationInput.customerFirstName;
        input.lastName = crmWarrantyRegistrationInput.customerLastName;
        input.email = crmWarrantyRegistrationInput.customerEmail;
        input.phone = crmWarrantyRegistrationInput.customerPhone;
        input[CRMCustomerMappingKeys.RoleCode] = 'CRM000';
        input.race = crmWarrantyRegistrationInput.customerRace;

        input.addressLine1 = crmWarrantyRegistrationInput.customerAddressLine1;
        input.addressLine2 = crmWarrantyRegistrationInput.customerAddressLine2;
        input.addressCity = crmWarrantyRegistrationInput.customerAddressCity;
        input.addressPostalCode = crmWarrantyRegistrationInput.customerAddressPostalCode;
        input.addressState = crmWarrantyRegistrationInput.customerAddressState;
        input.addressCountryCode = crmWarrantyRegistrationInput.customerAddressCountryCode;

        return input;
    }

    toC4CPayload(): any {
        return {
            Email: this.email,
            Phone: this.phone,
            RoleCode: this[CRMCustomerMappingKeys.RoleCode] || 'CRM000',
            FirstName: this.firstName,
            LastName: this.lastName,
            AddressLine1: this.addressLine1,
            AddressLine2: this.addressLine2,
            StreetPostalCode: this.addressPostalCode,
            City: this.addressCity,
            StateCode: this.addressState,
            // note(roy): why not using 'CountryCode' prop to create c4c? because it will mess with the phone number, by prefixing "+60 " to phone
            // note(roy): why not just give up 'CountryCode' and 'POBoxDeviatingCountryCode' entirely? Because 'StateCode' needs country to filter properly.
            POBoxDeviatingCountryCode: this.addressCountryCode,
            // eslint-disable-next-line @typescript-eslint/camelcase
            zRace_KUT: this.race,
        };
    }
}
