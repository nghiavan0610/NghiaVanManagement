const express = require('express');
const route = require('../routes');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const responseTime = require('response-time');
const cors = require('cors');

const createServer = () => {
    try {
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

        return app;
    } catch (err) {
        console.error('Can not create server', err);
    }
};

module.exports = { createServer };
