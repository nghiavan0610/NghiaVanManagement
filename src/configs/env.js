require('dotenv').config();

const {
    NODE_ENV,
    NODE_DOCKER_PORT,

} = process.env;

const config = {
    NODE_ENV,
    NODE_DOCKER_PORT,

};

module.exports = config;
