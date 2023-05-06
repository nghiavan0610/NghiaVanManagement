const mongoose = require('mongoose');
const { ApiError } = require('../../helpers/ErrorHandler');
const { User, Project, Job, Summary, Tru, BoChang, Mong } = require('../../db/models');

class SummaryService {
    // [POST] /v1/projects/:projectSlug/summary
    async handleSummary(authUser, projectSlug, formData) {
        try {
            const { isOriginal } = formData;
            const project = await Project.findOne({ slug: projectSlug }).select('_id manager leaders members').exec();
            if (!project) throw new ApiError(404, `Project was not found: ${projectSlug}`);

            if (
                authUser.role !== 'admin' &&
                !project.manager.equals(authUser.id) &&
                !project.leaders.some((leader) => leader.equals(authUser.id)) &&
                !project.members.some((member) => member.equals(authUser.id))
            ) {
                throw new ApiError(403, 'You do not have permission to access this project');
            }

            const summary = await Summary.findOneAndUpdate({ project: project._id, isOriginal: isOriginal }, formData, {
                upsert: true,
                runValidators: true,
                new: true,
            }).exec();

            if (isOriginal) {
                project.originalSummary = summary._id;

                const updatedSummary = await new Summary(summary.toObject());
                updatedSummary._id = mongoose.Types.ObjectId();
                updatedSummary.isOriginal = false;
                await updatedSummary.save();

                project.updatedSummary = updatedSummary._id;
            }
            await project.save();
            return summary;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new SummaryService();
