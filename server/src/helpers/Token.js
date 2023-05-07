const jwt = require('jsonwebtoken');
const config = require('../configs/env');

const generateAccessToken = async (userId) => {
    return jwt.sign({ userId: userId }, config.ACCESS_TOKEN_SECRET, {
        expiresIn: Number(config.ACCESS_TOKEN_EXPIRE),
    });
};

const generateRefreshToken = async (userId) => {
    return jwt.sign({ userId: userId }, config.REFRESH_TOKEN_SECRET, {
        expiresIn: Number(config.REFRESH_TOKEN_EXPIRE),
    });
};

const verifyAccessToken = async (token) => {
    return jwt.verify(token, config.ACCESS_TOKEN_SECRET);
};

const verifyRefreshToken = async (token) => {
    return jwt.verify(token, config.REFRESH_TOKEN_SECRET);
};

module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken };
