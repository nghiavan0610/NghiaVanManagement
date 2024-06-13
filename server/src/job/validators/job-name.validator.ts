import { Inject, Injectable } from '@nestjs/common';
import {
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    registerDecorator,
} from 'class-validator';
import { IJobService } from '../services/job-service.interface';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUniqueJobName implements ValidatorConstraintInterface {
    constructor(@Inject(IJobService) private readonly jobService: IJobService) {}

    async validate(name: string): Promise<boolean> {
        const job = await this.jobService._getProjectForValidate({ name });

        return job ? false : true;
    }
}

export function UniqueJobName(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'UniqueJobName',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsUniqueJobName,
        });
    };
}
