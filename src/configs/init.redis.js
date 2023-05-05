const redis = require('redis');
const config = require('./env');

const redisClient =
    config.NODE_ENV === 'production'
        ? redis.createClient({ url: `redis://${config.REDIS_HOST}` })
        : redis.createClient();

(async () => {
    try {
        await redisClient.connect();
        console.log(`Connection to Redis has been established successfully.`);
    } catch (err) {
        console.error('Unable to connect to Redis: ', err);
    }
})();

module.exports = redisClient;
