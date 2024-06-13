import { Inject, Injectable } from '@nestjs/common';
import {
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    registerDecorator,
} from 'class-validator';
import { IProjectService } from '../services/project-service.interface';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUniqueProjectCode implements ValidatorConstraintInterface {
    constructor(@Inject(IProjectService) private readonly projectService: IProjectService) {}

    async validate(code: string): Promise<boolean> {
        const project = await this.projectService._getProjectForValidate({ code });

        return project ? false : true;
    }
}

export function UniqueProjectCode(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'UniqueProjectCode',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsUniqueProjectCode,
        });
    };
}
