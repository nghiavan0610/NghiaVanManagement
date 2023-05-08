const config = require('../configs/env');

class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
    }
}

class ValidationError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
    }
}

const errorHandler = (err, req, res, next) => {
    if (err.name === 'ValidationError') {
        const errorMessages = Object.values(err.errors).map((error) => error.message);
        err = new ValidationError(403, errorMessages[0]);
    }

    if (err.name === 'MongoServerError' && err.code === 11000) {
        err = new ValidationError(403, 'Error, something expected to be unique.');
    }
    if (err.name === 'CastError') {
        err = new ApiError(403, err.message);
    }
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        success: 'false',
        name: err.name,
        message: err.message,
        stack: config.NODE_ENV !== 'production' ? null : err.stack,
    });
};

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

module.exports = { ApiError, ValidationError, notFound, errorHandler };
