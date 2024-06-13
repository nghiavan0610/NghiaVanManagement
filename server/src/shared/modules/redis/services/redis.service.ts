import { Inject, Injectable } from '@nestjs/common';
import { IRedisService } from './redis-service.interface';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements IRedisService {
    constructor(
        @Inject('IOREDIS_CLIENT') private readonly redis: Redis,
        private readonly configService: ConfigService,
    ) {}

    async onModuleDestroy(): Promise<void> {
        this.redis.disconnect(false);
    }

    buildKey(key: string): string {
        const prefix = this.configService.get('redis.prefix');

        return `${prefix}_${key}`;
    }

    get(key: string): Promise<string> {
        return this.redis.get(this.buildKey(key));
    }

    set(key: string, value: string, ttl: number): Promise<'OK'> {
        return this.redis.set(this.buildKey(key), value, 'EX', ttl);
    }

    async del(key: string): Promise<number> {
        return await this.redis.del(this.buildKey(key));
    }

    async delWithPrefix(prefix: string): Promise<number> {
        const keys = await this.redis.keys(`${prefix}*`);

        if (!keys.length) {
            return;
        }

        return await this.redis.del(keys);
    }
}
