import { Provider } from '@nestjs/common';
import { ILoggerService } from '../services/logger-service.interface';
import { LoggerService } from '../services/logger.service';

export const LoggerServiceProvider: Provider = {
    provide: ILoggerService,
    useClass: LoggerService,
};
