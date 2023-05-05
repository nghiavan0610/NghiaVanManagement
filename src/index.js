const express = require('express');
const route = require('./routes');
const morgan = require('morgan');
const config = require('./configs/env');
const db = require('./configs/init.mongodb');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const responseTime = require('response-time');
const cors = require('cors');

const app = express();

//
app.use(cors());

//
app.use(helmet());

// Cookie
app.use(cookieParser());

// HTTP logger
app.use(morgan('combined'));

//
app.use(responseTime());

// Compress response
app.use(compression());
app.use(
    express.urlencoded({
        extended: true,
        limit: '50mb',
    }),
);
app.use(express.json({ limit: '50mb' }));

// Route init
route(app);

// // Connect to db
db.connect();

app.listen(config.NODE_DOCKER_PORT || 3000, () => {
    console.log(`App listening on port ${config.NODE_DOCKER_PORT || 3000}`);
});
