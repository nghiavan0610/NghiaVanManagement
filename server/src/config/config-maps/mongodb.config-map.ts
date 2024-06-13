import { registerAs } from '@nestjs/config';

export default registerAs('mongodb', () => ({
    databaseUrl: process.env.MONGO_URL,
    dbName: process.env.MONGODB_NAME,
    authSource: process.env.MONGODB_AUTH,
}));
