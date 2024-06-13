import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';

export const IORedisClientProvider: Provider = {
    provide: 'IOREDIS_CLIENT',
    useFactory: async (configService: ConfigService) => {
        const options: RedisOptions = {
            host: configService.get('redis.host'),
            port: configService.get('redis.port'),
            password: configService.get('redis.pass'),
        };

        const client = new Redis(options);

        await new Promise((resolve, reject) => {
            client.once('connect', resolve);
            client.once('error', reject);
        });

        return client;
    },
    inject: [ConfigService],
};
