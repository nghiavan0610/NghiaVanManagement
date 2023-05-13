const { User, Job } = require('../db/models');
const { ApiError } = require('../helpers/ErrorHandler');

const filterModel = (Model, options = true) => {
    return async (req, res, next) => {
        try {
            const search = req.query.search || '';
            const job_title = req.query.job_title || '';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const pipeline = [];

            switch (Model) {
                case 'User':
                    pipeline.push({
                        $match: {
                            $or: [
                                { name: { $regex: search, $options: 'i' } },
                                { email: { $regex: search, $options: 'i' } },
                            ],
                        },
                    });
                    pipeline.push({
                        $lookup: {
                            from: Job.collection.name,
                            localField: 'job',
                            foreignField: '_id',
                            as: 'job',
                        },
                    });
                    pipeline.push({
                        $unwind: '$job',
                    });
                    pipeline.push({
                        $project: {
                            name: 1,
                            _id: 1,
                            role: 1,
                            slug: 1,
                            deleted: 1,
                            'job._id': 1,
                            'job.name': 1,
                            'job.slug': 1,
                        },
                    });
                    pipeline.push({
                        $match: {
                            $and: [{ 'job.slug': { $regex: job_title } }, { job: { $ne: [] } }],
                        },
                    });
                    break;

                case 'Project':
                    pipeline.push({
                        $match: {
                            $or: [
                                { name: { $regex: search, $options: 'i' } },
                                { code: { $regex: search, $options: 'i' } },
                                { location: { $regex: search, $options: 'i' } },
                            ],
                        },
                    });
                    pipeline.push({
                        $lookup: {
                            from: User.collection.name,
                            localField: 'manager',
                            foreignField: '_id',
                            as: 'manager',
                        },
                    });
                    pipeline.push({
                        $project: {
                            name: 1,
                            _id: 1,
                            code: 1,
                            location: 1,
                            startedAt: 1,
                            isDone: 1,
                            deleted: 1,
                            slug: 1,
                            'manager._id': 1,
                            'manager.name': 1,
                        },
                    });
                    break;

                case 'Material':
                    pipeline.push({
                        $match: { name: { $regex: search, $options: 'i' } },
                    });
                    pipeline.push({
                        $project: {
                            name: 1,
                            _id: 1,
                            slug: 1,
                        },
                    });
                    break;

                default:
                    throw new ApiError(404, `Invalid Model: ${Model}`);
            }

            if (options) {
                pipeline.push({
                    $facet: {
                        results: [
                            {
                                $sort: { startedAt: 1, name: 1 },
                            },
                            { $skip: skip },
                            { $limit: limit },
                        ],
                        count: [{ $count: 'total' }],
                    },
                });
            }

            req.pipeline = pipeline;
            next();
        } catch (err) {
            next(err);
        }
    };
};

module.exports = filterModel;
