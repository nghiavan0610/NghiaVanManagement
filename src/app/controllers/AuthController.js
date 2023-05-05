const authService = require('../services/AuthService');
const config = require('../../configs/env');
const { response } = require('../../helpers/Response');

class AuthController {
    // [POST] /v1/auth/signin
    async signin(req, res, next) {
        try {
            const credentials = req.body;
            const [accessToken, refreshToken, user] = await authService.signin(credentials);
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                maxAge: config.ACCESS_TOKEN_EXPIRE * 1000,
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                maxAge: config.REFRESH_TOKEN_EXPIRE * 1000,
            });
            res.status(200).json(response({ accessToken, refreshToken, user }));
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new AuthController();
