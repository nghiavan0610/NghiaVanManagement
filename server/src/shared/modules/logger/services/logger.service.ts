import { Injectable, Inject, Scope } from '@nestjs/common';
import * as winston from 'winston';
import { ILoggerService } from './logger-service.interface';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements ILoggerService {
    constructor(@Inject('LOGGER_PROVIDER') private readonly logger: winston.Logger) {}

    public debug(message: string, ...args: any[]): void {
        this.logger.debug(message, args);
    }

    public info(message: string, ...args: any[]): void {
        this.logger.info(message, args);
    }

    public warn(message: string, ...args: any[]): void {
        this.logger.warn(message, args);
    }

    public error(message: string, ...args: any[]): void {
        this.logger.error(message, args);
    }
}
