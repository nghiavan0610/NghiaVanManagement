const { ApiError } = require('../../helpers/ErrorHandler');
const { User, Job } = require('../../db/models');

class UserService {
    // [GET] /api/v1/users
    async getAllUsers(pipeline, page, limit) {
        try {
            const users = await User.aggregate(pipeline).exec();
            const total = Array.isArray(users[0].count) && users[0].count.length > 0 ? users[0].count[0].total : 0;
            const totalPages = Math.ceil(total / limit);
            return {
                users: users[0].results,
                page,
                totalUsers: total,
                totalPages,
            };
        } catch (err) {
            throw err;
        }
    }

    // [GET] /api/v1/users/:userSlug
    async getUserBySlug(userSlug) {
        try {
            const user = await User.findOne({ slug: userSlug })
                .populate('job', 'name')
                .populate('deletedBy', 'name')
                .exec();
            if (!user) throw new ApiError(404, `User was not found: ${userSlug}`);

            return user;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new UserService();
