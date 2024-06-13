import { Injectable, Inject } from '@nestjs/common';
import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationOptions,
    registerDecorator,
} from 'class-validator';
import { IUserService } from '../services/user-service.interface';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUniquePhoneNumber implements ValidatorConstraintInterface {
    constructor(@Inject(IUserService) private readonly userService: IUserService) {}

    async validate(phoneNumber: string): Promise<boolean> {
        const user = await this.userService._getUserForValidate({ phoneNumber });

        return user ? false : true;
    }
}

export function UniquePhoneNumber(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'UniquePhoneNumber',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsUniquePhoneNumber,
        });
    };
}
