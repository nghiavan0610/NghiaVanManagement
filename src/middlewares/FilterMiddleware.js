const { User, Job } = require('../db/models');

const filterModel = (Model, options = true) => {
    return async (req, res, next) => {
        try {
            const { search, job_title } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const pipeline = [];

            if (Model === 'User') {
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
