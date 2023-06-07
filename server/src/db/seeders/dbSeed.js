const models = require('../models');
const seedData = require('../database');

module.exports = {
    async up() {
        try {
            for (const modelName in models) {
                if (models.hasOwnProperty(modelName)) {
                    const model = models[modelName];
                    const data = seedData[modelName] || [];
                    // await model.deleteMany();
                    await model.insertMany(data);
                    console.log(`Seed ${modelName} data has been added to database`);
                }
            }
        } catch (err) {
            throw err;
        }
    },

    async down() {
        try {
            for (const modelName in models) {
                if (models.hasOwnProperty(modelName)) {
                    const model = models[modelName];
                    // await model.deleteMany(null);
                    await model.collection.drop();
                    console.log(`Seed ${modelName} data has been deleted`);
                }
            }
        } catch (err) {
            if (err.code !== 26) {
                throw err;
            }
        }
    },
};
