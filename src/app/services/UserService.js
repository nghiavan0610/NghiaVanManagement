const { ApiError } = require('../../helpers/ErrorHandler');
const { User } = require('../../db/models');

class UserService {
    // [GET] /api/v1/users/:userSlug
    async getUserBySlug(userSlug) {
        try {
            const user = await User.findOne({ slug: userSlug }).populate('deletedBy', 'name').exec();
            if (!user) throw new ApiError(404, `User was not found: ${userSlug}`);

            return user;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new UserService();
