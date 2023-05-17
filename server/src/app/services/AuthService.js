const { ApiError } = require('../../helpers/ErrorHandler');
const { User } = require('../../db/models');
const config = require('../../configs/env');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../../helpers/Token');
const { mongooseToObject } = require('../../utils/mongooseToObject');
const redisClient = require('../../configs/init.redis');

class AuthService {
    // [POST] /v1/auth/signin
    async signin(credentials) {
        try {
            const { username, password } = credentials;
            let user = await User.findOne({ username }, '_id name deleted slug role password')
                .populate('job', 'name')
                .exec();

            if (user?.deleted) throw new ApiError(403, `This account has been disabled`);

            if (user && user.comparePassword(password)) {
                const accessToken = await generateAccessToken(user.id);
                const refreshToken = await generateRefreshToken(user.id);

                await redisClient.set(`accessToken:${user.id}`, accessToken, 'EX', config.ACCESS_TOKEN_EXPIRE);
                await redisClient.set(`refreshToken:${user.id}`, refreshToken, 'EX', config.REFRESH_TOKEN_EXPIRE);
                user = mongooseToObject(user);
                return [accessToken, refreshToken, user];
            } else {
                throw new ApiError(401, 'Invalid username or password');
            }
        } catch (err) {
            throw err;
        }
    }

    // [POST] /v1/auth/refresh-token
    async createNewAccessToken(refreshToken) {
        try {
            if (!refreshToken || refreshToken === 'undefined') {
                throw new ApiError(401, 'Refresh Token was not found');
            }

            const decoded = await verifyRefreshToken(refreshToken);
            const user = await User.findById(decoded.userId, '_id').exec();
            const storedRefreshToken = await redisClient.get(`refreshToken:${user.id}`);

            if (!user || refreshToken !== storedRefreshToken) {
                throw new ApiError(401, 'Refresh Token has been revoked');
            }

            const accessToken = await generateAccessToken(user.id);
            await redisClient.set(`accessToken:${user.id}`, accessToken, 'EX', config.ACCESS_TOKEN_EXPIRE);

            return accessToken;
        } catch (err) {
            throw err;
        }
    }

    // [GET] /v1/auth/signout
    async signout(userId) {
        try {
            await redisClient.del(`accessToken:${userId}`);
            await redisClient.del(`refreshToken:${userId}`);
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new AuthService();
