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
export class IsUniqueUsername implements ValidatorConstraintInterface {
    constructor(@Inject(IUserService) private readonly userService: IUserService) {}

    async validate(username: string): Promise<boolean> {
        const user = await this.userService._getUserForValidate({ username });

        return user ? false : true;
    }
}

export function UniqueUsername(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'UniqueUsername',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsUniqueUsername,
        });
    };
}
