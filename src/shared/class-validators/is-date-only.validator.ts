import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import moment = require('moment');

@ValidatorConstraint()
export class IsDateOnlyConstraint implements ValidatorConstraintInterface {
    validate(value: any) {
        if (typeof value === 'string') {
            return /^[1-9]\d*-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value) && moment(value, 'YYYY-MM-DD').isValid();
        }
        return false;
    }

    defaultMessage({ property }) {
        return `${property} must be a valid date (Required format: YYYY-MM-DD)`;
    }
}

export function IsDateOnly(validationOptions?: ValidationOptions) {
    return function(object: Record<string, any>, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsDateOnlyConstraint,
        });
    };
}
