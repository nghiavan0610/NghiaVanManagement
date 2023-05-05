require('dotenv').config();

const {
    NODE_ENV,
    NODE_DOCKER_PORT,

    MONGODB_NAME,
    MONGODB_HOST,
    MONGODB_USER,
    MONGODB_PASSWORD,

    REDIS_HOST,
} = process.env;

const config = {
    NODE_ENV,
    NODE_DOCKER_PORT,

    REDIS_HOST,

    MONGODB_URI: `mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}/${MONGODB_NAME}?authSource=admin`,
};

module.exports = config;
