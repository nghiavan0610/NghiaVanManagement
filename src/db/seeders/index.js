const mongoose = require('mongoose');
const db = require('../../configs/init.mongodb');
const dbSeed = require('./dbSeed');

(async function seed() {
    try {
        const arg = process.argv[2];
        await db.connect();

        if (arg === 'up') {
            await dbSeed.up();
            console.log('[ADDED] All seed data has been added to database');
        } else if (arg === 'down') {
            await dbSeed.down();
            console.log('[DELETED] All seed data has been removed from database');
        } else {
            console.error('Invalid seed action!');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
        console.log('Seed connection closed');
    }
})();
