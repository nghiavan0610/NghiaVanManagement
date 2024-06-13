import { Global, Module } from '@nestjs/common';
import { RedisServiceProvider } from './providers/redis-service.provider';
import { IORedisClientProvider } from './providers/redis.provider';
import { IRedisService } from './services/redis-service.interface';

@Global()
@Module({
    providers: [IORedisClientProvider, RedisServiceProvider],
    exports: [IRedisService],
})
export class RedisModule {}
