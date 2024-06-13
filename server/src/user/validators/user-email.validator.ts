import { Inject, Injectable } from '@nestjs/common';
import {
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    registerDecorator,
} from 'class-validator';
import { IUserService } from '../services/user-service.interface';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUniqueEmail implements ValidatorConstraintInterface {
    constructor(@Inject(IUserService) private readonly userService: IUserService) {}

    async validate(email: string): Promise<boolean> {
        const user = await this.userService._getUserForValidate({ email });

        return user ? false : true;
    }
}

export function UniqueEmail(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'UniqueEmail',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsUniqueEmail,
        });
    };
}
