const express = require('express');
const v1Router = express.Router();
const authRouter = require('./auth');
const userRouter = require('./user');
const projectRouter = require('./project');

v1Router.use('/auth', authRouter);
v1Router.use('/users', userRouter);
v1Router.use('/projects', projectRouter);

module.exports = v1Router;
