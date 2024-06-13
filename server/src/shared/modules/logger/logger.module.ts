import { Global, Module } from '@nestjs/common';
import { LoggerServiceProvider } from './providers/logger-service.provider';
import { ILoggerService } from './services/logger-service.interface';
import { LoggerProvider } from './providers/logger.provider';

@Global()
@Module({
    providers: [LoggerProvider, LoggerServiceProvider],
    exports: [ILoggerService],
})
export class LoggerModule {}
