import {
    ArgumentsHost,
    BadRequestException,
    HttpStatus,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import { CustomException } from '../exceptions/custom.exception';
import mongoose from 'mongoose';

export class AllExceptionFilter extends BaseExceptionFilter {
    catch(exception: any, host: ArgumentsHost): void {
        if (exception instanceof CustomException) {
            return this.catchCustomException(exception, host);
        }

        if (exception instanceof UnauthorizedException) {
            return this.catchUnauthorizedException(exception, host);
        }

        if (exception instanceof BadRequestException || exception.statusCode == HttpStatus.BAD_REQUEST) {
            return this.catchBadRequestException(exception, host);
        }

        if (exception instanceof NotFoundException || exception.statusCode == HttpStatus.NOT_FOUND) {
            return this.catchNotFoundException(exception, host);
        }

        if (exception instanceof mongoose.Error) {
            return this.catchMongooseException(exception, host);
        }

        this.catchUnknownException(exception, host);
    }

    catchUnauthorizedException(exception: UnauthorizedException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        response.status(HttpStatus.UNAUTHORIZED).json({
            success: false,
            statusCode: HttpStatus.UNAUTHORIZED,
            errorCode: 'UNAUTHORIZED',
            errorMessage: 'UNAUTHORIZED',
        });
    }

    catchNotFoundException(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        response.status(HttpStatus.NOT_FOUND).json({
            success: false,
            statusCode: HttpStatus.NOT_FOUND,
            errorCode: 'NOT_FOUND',
            error: exception?.message,
        });
    }

    catchBadRequestException(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        response.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            statusCode: HttpStatus.BAD_REQUEST,
            errorCode: 'BAD_REQUEST',
            errorMessage: exception?.message,
        });
    }

    catchUnknownException(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            errorCode: exception?.code || 'INTERNAL_SERVER_ERROR',
            errorMessage: exception?.message,
        });
    }

    catchCustomException(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        response.status(exception.statusCode).json({
            success: false,
            statusCode: exception.statusCode,
            errorCode: exception.getErrorCode(),
            errorMessage: exception.message,
        });
    }

    catchMongooseException(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        response.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            statusCode: HttpStatus.BAD_REQUEST,
            errorCode: 'MONGOOSE_ERROR',
            errorMessage: exception?.message,
        });
    }
}
