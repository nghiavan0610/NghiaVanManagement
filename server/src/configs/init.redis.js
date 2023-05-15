const redis = require('redis');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/mongodbConfig')[env];

let redisClient;
if (config.REDIS_URI) {
    redisClient = redis.createClient({ url: config.REDIS_URI });
} else {
    redisClient = redis.createClient();
}

(async () => {
    try {
        await redisClient.connect();
        console.log(`Connection to Redis has been established successfully.`);
    } catch (err) {
        console.error('Unable to connect to Redis: ', err);
    }
})();

module.exports = redisClient;
