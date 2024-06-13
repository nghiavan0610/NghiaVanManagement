import { Provider } from '@nestjs/common';
import { IRedisService } from '../services/redis-service.interface';
import { RedisService } from '../services/redis.service';

export const RedisServiceProvider: Provider = {
    provide: IRedisService,
    useClass: RedisService,
};
