import { Inject, Injectable } from '@nestjs/common';
import {
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    registerDecorator,
} from 'class-validator';
import { ICategoryService } from '../services/category-service.interface';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUniqueCategoryName implements ValidatorConstraintInterface {
    constructor(@Inject(ICategoryService) private readonly categoryService: ICategoryService) {}

    async validate(name: string): Promise<boolean> {
        const category = await this.categoryService._getCategoryForValidate({ name });

        return category ? false : true;
    }
}

export function UniqueCategoryName(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'UniqueCategoryName',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsUniqueCategoryName,
        });
    };
}
