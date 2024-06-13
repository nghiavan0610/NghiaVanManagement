export interface IRedisService {
    onModuleDestroy(): Promise<void>;
    buildKey(key: string): string;
    get(key: string): Promise<string>;
    set(key: string, value: string, ttl: number): Promise<'OK'>;
    del(key: string): Promise<number>;
    delWithPrefix(prefix: string): Promise<number>;
}

export const IRedisService = Symbol('IRedisService');
