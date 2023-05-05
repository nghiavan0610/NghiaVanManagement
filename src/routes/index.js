const v1Router = require('./v1');

const route = (app) => {
    app.get('/', (req, res, next) => {
        return res.status(200).json({
            status: 'success',
            message: 'Welcome to Electric Management API - created by Nghia Van!',
        });
    });

    app.use('/v1', v1Router);
};

module.exports = route;
