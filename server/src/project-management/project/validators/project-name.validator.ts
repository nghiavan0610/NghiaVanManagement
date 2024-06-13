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
export class IsUniqueProjectName implements ValidatorConstraintInterface {
    constructor(@Inject(IProjectService) private readonly projectService: IProjectService) {}

    async validate(name: string): Promise<boolean> {
        const project = await this.projectService._getProjectForValidate({ name });

        return project ? false : true;
    }
}

export function UniqueProjectName(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'UniqueProjectName',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsUniqueProjectName,
        });
    };
}
