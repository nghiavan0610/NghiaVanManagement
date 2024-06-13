import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    pass: process.env.REDIS_PASS,
    prefix: process.env.REDIS_PREFIX,
}));
