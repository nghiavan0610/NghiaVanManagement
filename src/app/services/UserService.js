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

    // [POST] /api/v1/users/create-user
    async createUser(formData) {
        try {
            const { username, email, name, gender, birthdate, phoneNumber, address, role, jobId } = formData;
            const [existsUsername, job] = await Promise.all([
                User.find({ username }).limit(1).exec(),
                Job.findById(jobId).exec(),
            ]);

            if (existsUsername[0]) throw new ApiError(403, 'Username already exists');

            const newUser = await User.create({
                username,
                name,
                password: username,
                email,
                gender,
                phoneNumber,
                address,
                role,
                DOB: birthdate,
                job: jobId,
            });
            return newUser;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new UserService();
