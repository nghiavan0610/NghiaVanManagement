const userService = require('../services/UserService');
const { response } = require('../../helpers/Response');

class UserController {
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
}

module.exports = new UserController();
