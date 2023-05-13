const db = require('../configs/init.mongodb');
// const redis = require('../configs/init.redis');
const config = require('../configs/env');

beforeAll(async () => {
    if (config.NODE_ENV === 'test') {
        await db.connectMongo();
        // await redis.connectRedis();
    }
});
