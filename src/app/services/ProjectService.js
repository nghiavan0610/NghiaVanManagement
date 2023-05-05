const { ApiError } = require('../../helpers/ErrorHandler');
const { User, Project } = require('../../db/models');

class ProjectService {
    // [GET] /v1/projects/:projectSlug
    async getProjectBySlug(projectSlug) {
        try {
            const project = await Project.findOne({ slug: projectSlug })
                .populate('deletedBy', 'name')
                .populate({
                    path: 'manager',
                    select: '_id name deleted',
                    populate: { path: 'job', select: '_id name' },
                })
                .populate({
                    path: 'leaders',
                    select: '_id name deleted',
                    populate: { path: 'job', select: '_id name' },
                })
                .populate({
                    path: 'members',
                    select: '_id name deleted',
                    populate: { path: 'job', select: '_id name' },
                })
                .exec();
            if (!project) throw new ApiError(404, `Project was not found: ${projectSlug}`);
            return project;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new ProjectService();
