const { ApiError } = require('../helpers/ErrorHandler');
const { verifyAccessToken } = require('../helpers/Token');
const redisClient = require('../configs/init.redis');

const User = require('../db/models/user');

const authenticateToken = async (req, res, next) => {
    try {
        const { authorization } = req.headers;

        if (!authorization || !authorization.startsWith('Bearer')) {
            throw new ApiError(401, 'Invalid authorization');
        }

        const accessToken = authorization.split(' ')[1];
        if (!accessToken || accessToken === 'undefined') {
            throw new ApiError(401, 'Access Token was not found');
        }

        const payload = await verifyAccessToken(accessToken);

        const user = await User.findById(payload.userId);
        if (!user) {
            throw new ApiError(401, `Account does not exist`);
        }
        const storedAccessToken = await redisClient.get(`accessToken:${user.id}`);
        if (accessToken !== storedAccessToken) {
            throw new ApiError(401, 'Access token has been revoked');
        }
        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            next(new ApiError(401, 'Access token has been timed out'));
        }
        if (
            err.name === 'JsonWebTokenError' &&
            (err.message === 'invalid signature' || err.message === 'jwt malformed')
        ) {
            next(new ApiError(401, 'Invalid signature'));
        }
        next(err);
    }
};

module.exports = { authenticateToken };
