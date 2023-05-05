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
            let user = await User.findOne({ username }, '_id name deleted slug role password').exec();
            if (user?.deleted) throw new ApiError(403, `Tài khoản đã bị vô hiệu hóa`);

            if (user && user.comparePassword(password)) {
                const accessToken = await generateAccessToken(user.id);
                const refreshToken = await generateRefreshToken(user.id);

                await redisClient.set(`accessToken:${user.id}`, accessToken, 'EX', config.ACCESS_TOKEN_EXPIRE);
                await redisClient.set(`refreshToken:${user.id}`, refreshToken, 'EX', config.REFRESH_TOKEN_EXPIRE);
                user = mongooseToObject(user);
                return [accessToken, refreshToken, user];
            } else {
                throw new ApiError(404, 'Sai tên đăng nhập hoặc mật khẩu');
            }
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new AuthService();
