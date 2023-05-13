const mongoose = require('mongoose');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/mongodbConfig')[env];

const connectMongo = async () => {
    try {
        const options = { useNewUrlParser: true, useUnifiedTopology: true };
        await mongoose.connect(config.MONGODB_URI, options);
        console.log(`Connection to MongoDb has been established successfully.`);
    } catch (err) {
        console.log('Unable to connect to MongoDb: ', err);
    }
};

module.exports = { connectMongo };
