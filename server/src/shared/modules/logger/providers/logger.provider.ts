import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';

export const LoggerProvider: Provider = {
    provide: 'LOGGER_PROVIDER',
    useFactory: async (configService: ConfigService) => {
        const { combine, timestamp, simple, align, colorize } = winston.format;

        const logger = winston.createLogger({
            exitOnError: false,
            level: configService.get('logger.level'),
            defaultMeta: { service: configService.get('app.name') },
            format: combine(timestamp(), align(), colorize(), simple()),
            transports: [new winston.transports.Console()],
        });

        return logger;
    },
    inject: [ConfigService],
};
