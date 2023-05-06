const express = require('express');
const v1Router = express.Router();
const authRouter = require('./auth');
const userRouter = require('./user');
const projectRouter = require('./project');
const jobRouter = require('./job');
const materialRouter = require('./material');

v1Router.use('/auth', authRouter);
v1Router.use('/users', userRouter);
v1Router.use('/projects', projectRouter);
v1Router.use('/jobs', jobRouter);
v1Router.use('/materials', materialRouter);

module.exports = v1Router;
