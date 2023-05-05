const userService = require('../services/UserService');
const { response } = require('../../helpers/Response');

class UserController {
    // [GET] /v1/users
    async getAllUsers(req, res, next) {
        try {
            const pipeline = req.pipeline;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await userService.getAllUsers(pipeline, page, limit);
            res.status(200).json(response(result));
        } catch (err) {
            next(err);
        }
    }

    // [GET] /v1/users/:userSlug
    async getUserBySlug(req, res, next) {
        try {
            const { userSlug } = req.params;
            const user = await userService.getUserBySlug(userSlug);
            res.status(200).json(response({ user }));
        } catch (err) {
            next(err);
        }
    }

    // [POST] /v1/users/create
    async createUser(req, res, next) {
        try {
            const formData = req.body;
            const newUser = await userService.createUser(formData);
            res.status(201).json(response({ newUser }));
        } catch (err) {
            next(err);
        }
    }

    // [PUT] /v1/users/:userSlug/edit-account
    async updateUserAccount(req, res, next) {
        try {
            const formData = req.body;
            const { userSlug } = req.params;
            const authUser = req.user;
            const updatedUser = await userService.updateUserAccount(userSlug, formData, authUser);
            res.status(201).json(response({ updatedUser }));
        } catch (err) {
            next(err);
        }
    }

    // [PUT] /v1/users/:userSlug/edit-security
    async updateUserSecurity(req, res, next) {
        try {
            const formData = req.body;
            const { userSlug } = req.params;
            const authUser = req.user;
            await userService.updateUserSecurity(userSlug, formData, authUser);
            res.status(201).json(response('Your password has been updated'));
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new UserController();
