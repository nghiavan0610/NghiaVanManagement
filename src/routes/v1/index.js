const express = require('express');
const v1Router = express.Router();
const userRouter = require('./user');

v1Router.use('/users', userRouter);

module.exports = v1Router;
