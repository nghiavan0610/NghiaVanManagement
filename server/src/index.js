const config = require('./configs/env');
const db = require('./configs/init.mongodb');

const { createServer } = require('./configs/server');

const app = createServer();
app.listen(config.NODE_DOCKER_PORT || 8060, async () => {
    console.log(`App listening on port ${config.NODE_DOCKER_PORT || 8060}`);

    await db.connectMongo();
});
