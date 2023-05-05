const mongoose = require('mongoose');
const config = require('./env');

const env = config.NODE_ENV || 'development';

const connect = async () => {
    try {
        const URI = env === 'production' ? config.MONGODB_URI : `mongodb://127.0.0.1:27017/dev_db`;
        const options = { useNewUrlParser: true, useUnifiedTopology: true };
        await mongoose.connect(URI, options);
        console.log(`Connection to MongoDb has been established successfully.`);
    } catch (err) {
        console.log('Unable to connect to MongoDb: ', err);
    }
};

module.exports = { connect };
