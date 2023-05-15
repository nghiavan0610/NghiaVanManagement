const config = require('./env');
module.exports = {
    development: {
        MONGODB_URI: `mongodb://127.0.0.1:27017/nghiavanec_db_dev`,
    },
    test: {
        MONGODB_URI: `mongodb://127.0.0.1:27017/nghiavanec_db_test`,
    },
    production: {
        MONGODB_URI: `mongodb://${config.MONGODB_USER}:${config.MONGODB_PASSWORD}@${config.MONGODB_HOST}/${config.MONGODB_NAME}?authSource=admin`,
        REDIS_URI: `redis://${config.REDIS_HOST}`,
    },
};
