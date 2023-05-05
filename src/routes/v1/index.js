const express = require('express');
const v1Router = express.Router();
const authRouter = require('./auth');
const userRouter = require('./user');

v1Router.use('/auth', authRouter);
v1Router.use('/users', userRouter);

module.exports = v1Router;
