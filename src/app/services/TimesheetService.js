const { ApiError } = require('../../helpers/ErrorHandler');
const { User, Project, Job, Timesheet, TimesheetDetail } = require('../../db/models');
const { removeS3 } = require('../../middlewares/S3Middleware');

class TimesheetService {
    // [GET] /v1/projects/:projectSlug/timesheet
    async getTimesheet(projectSlug) {
        try {
            const project = await Project.findOne({ slug: projectSlug })
                .select('_id name code location description slug')
                .populate({
                    path: 'timesheet',
                    populate: [
                        { path: 'manager', select: '_id name' },
                        { path: 'members', select: '_id name' },
                        { path: 'timesheetDetail' },
                    ],
                });

            return project;
        } catch (err) {
            throw err;
        }
    }

    // [POST] /v1/projects/:projectSlug/timesheet/upload-file
    async uploadFile(authUser, formData, files) {
        try {
            const { timesheetId, workDate } = formData;

            const timesheet = await Timesheet.findById(timesheetId).exec();
            if (
                !timesheet.manager.equals(authUser._id) &&
                !timesheet.members.some((member) => member.equals(authUser._id))
            ) {
                throw new ApiError(403, `You do not have permission to access this project's timekeeping`);
            }

            // workDate isn't more than 10 days
            if (
                new Date().getTime() - new Date(workDate).getTime() > 10 * 24 * 60 * 60 * 1000 &&
                !timesheet.manager.equals(authUser._id) &&
                authUser.role !== 'admin'
            ) {
                throw new ApiError(403, `You are 10 days late. Please contact the project manager`);
            }

            let timesheetDetail = await TimesheetDetail.findOne({ timesheet: timesheetId, workDate }).exec();

            if (!timesheetDetail) {
                timesheetDetail = await TimesheetDetail.create({ timesheet: timesheetId, workDate });
            }

            for (const file of files) {
                timesheetDetail.proofs.push({
                    proofName: file.originalname,
                    proofUri: file.location,
                    isApproved: false,
                });
            }
            await timesheetDetail.save();

            const timesheetDetailIndex = timesheet.timesheetDetail.findIndex(
                (tsDetail) => tsDetail.toString() === timesheetDetail._id.toString(),
            );

            if (timesheetDetailIndex === -1) {
                timesheet.timesheetDetail.push(timesheetDetail._id);
            }
            await timesheet.save();

            return timesheetDetail;
        } catch (err) {
            throw err;
        }
    }

    // [DELETE] /v1/projects/:projectSlug/timesheet/delete-file
    async deleteFile(authUser, formData) {
        try {
            const { timesheetId, workDate, proofId } = formData;

            const timesheet = await Timesheet.findById(timesheetId).exec();
            if (
                !['admin'].includes(authUser.role) &&
                !timesheet.manager.equals(authUser._id) &&
                !timesheet.members.some((member) => member.equals(authUser._id))
            ) {
                throw new ApiError(403, `You do not have permission to access this project's timekeeping`);
            }

            const timesheetDetail = await TimesheetDetail.findOne({ timesheet: timesheetId, workDate }).exec();

            const proofIndex = timesheetDetail.proofs.findIndex((proof) => proof._id.toString() === proofId);
            if (proofIndex === -1) throw new ApiError(404, `Document was not found: ${proofId}`);

            const proofKey = timesheetDetail.proofs[proofIndex].proofUri.split(`toantamec-proof/`)[1];
            if (proofKey) await removeS3(proofKey);

            timesheetDetail.proofs.splice(proofIndex, 1);

            await timesheetDetail.save();
        } catch (err) {
            throw err;
        }
    }

    // [PUT] /v1/projects/:projectSlug/timesheet/review
    async updateTimesheet(authUser, projectSlug, formData) {
        try {
            const { timesheetId, workDate, comment, proofId, isApproved } = formData;
            const [project, timesheet] = await Promise.all([
                Project.findOne({ slug: projectSlug }).select('_id manager leaders members').exec(),
                Timesheet.findById(timesheetId).exec(),
            ]);

            if (
                !['admin'].includes(authUser.role) &&
                !project.manager.equals(authUser.id) &&
                !project.leaders.some((leader) => leader.equals(authUser.id))
            ) {
                throw new ApiError(403, `You do not have permission to access this project's timekeeping`);
            }

            let timesheetDetail = await TimesheetDetail.findOne({ timesheet: timesheetId, workDate }).exec();

            if (!timesheetDetail) {
                timesheetDetail = await TimesheetDetail.create({ timesheet: timesheetId, workDate });
                timesheet.timesheetDetail.push(timesheetDetail._id);
                await timesheet.save();
            }
            timesheetDetail.comment = comment;

            if (proofId) {
                const proofIndex = timesheetDetail.proofs.findIndex((proof) => proof._id.toString() === proofId);
                if (proofIndex === -1) throw new ApiError(404, `Document was not found: ${proofId}`);
                timesheetDetail.proofs[proofIndex].isApproved = isApproved;
            }

            await timesheetDetail.save();
            return timesheetDetail;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new TimesheetService();
