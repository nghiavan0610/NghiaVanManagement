import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import * as _ from 'lodash';
import { CustomException } from '../exceptions/custom.exception';

export class GlobalValidationPipe {
    default() {
        return new ValidationPipe({
            whitelist: false,
            transform: true,
            // transformOptions: {
            // excludeExtraneousValues: true,
            // enableImplicitConversion: true,
            // },
            exceptionFactory: this.exceptionFactory,
        });
    }

    exceptionFactory(validationErrors: ValidationError[] = []) {
        const errorObject = {};

        const getExceptions = (validationErrors: ValidationError[], errors: any) => {
            validationErrors.forEach((validationError: ValidationError) => {
                const err = _.values(validationError.constraints);
                errors[validationError.property] = _.first(err);

                if (!err.length && validationError.children.length) {
                    errors[validationError.property] = {};
                    getExceptions(validationError.children, errors[validationError.property]);
                }
            });
        };

        getExceptions(validationErrors, errorObject);

        throw new CustomException({
            message: errorObject,
            statusCode: HttpStatus.BAD_REQUEST,
        });
    }
}
