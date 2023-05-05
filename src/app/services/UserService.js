const { ApiError } = require('../../helpers/ErrorHandler');
const { User, Job } = require('../../db/models');
const redisClient = require('../../configs/init.redis');
const { generateAccessToken } = require('../../helpers/Token');
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

    // [POST] /api/v1/users/create
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

    // [PUT] /api/v1/users/:userSlug/edit-account
    async updateUserAccount(userSlug, formData, authUser) {
        try {
            const { jobId, role, ...profile } = formData;

            let updatedUser;
            // Allow admin to update user account
            // Manager/ User can only update their profile (not include job and role)
            if (authUser.slug === userSlug) {
                updatedUser = await User.findOneAndUpdate(
                    {
                        slug: userSlug,
                    },
                    profile,
                    { returnDocument: 'after', runValidators: true },
                ).exec();
            } else if (['admin'].includes(authUser.role)) {
                await Job.findById(jobId).exec();

                const updatedProfile = { ...profile, role, job: jobId };
                updatedUser = await User.findOneAndUpdate(
                    {
                        slug: userSlug,
                    },
                    updatedProfile,
                    { returnDocument: 'after', runValidators: true },
                ).exec();
            } else {
                throw new ApiError(403, 'You do not have permission to perform this action');
            }

            if (!updatedUser) throw new ApiError(404, `User was not found: ${userSlug}`);
            return updatedUser;
        } catch (err) {
            if (err.name === 'MongoServerError' && err.code === 11000) {
                throw new ApiError(403, 'Username already exists');
            }
            throw err;
        }
    }

    // [PUT] /api/v1/users/:userSlug/edit-security
    async updateUserSecurity(userSlug, formData, authUser) {
        try {
            const { oldPassword, newPassword, confirmPassword } = formData;
            const user = await User.findOne({ slug: userSlug }).select('_id password').exec();
            if (!user) throw new ApiError(404, `User was not found: ${userSlug}`);

            // Allow admin to change user password
            // User can only change their password
            if (!'admin'.includes(authUser.role) && authUser.slug !== userSlug) {
                throw new ApiError(403, 'You do not have permission to perform this action');
            }

            if (newPassword.length < 6 || newPassword.length > 20) {
                throw new ApiError(403, 'Your password must be between 6 and 20 characters');
            }

            if (authUser.slug === userSlug && !user.comparePassword(oldPassword)) {
                throw new ApiError(403, 'Your password is incorrect');
            }

            if (newPassword !== confirmPassword) {
                throw new ApiError(403, 'Confirm password is incorrect');
            }

            user.password = confirmPassword;
            await user.save({ validateBeforeSave: true });
            await generateAccessToken(user._id);

            await redisClient.del(`accessToken:${user.id}`);
            await redisClient.del(`refreshToken:${user.id}`);
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new UserService();
