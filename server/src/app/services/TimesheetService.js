const { ApiError } = require('../../helpers/ErrorHandler');
const { User, Project, Job, Timesheet, TimesheetDetail } = require('../../db/models');
const { removeS3 } = require('../../middlewares/S3Middleware');

class TimesheetService {
    // [GET] /v1/projects/:projectSlug/timesheet
    async getTimesheet(projectSlug) {
        try {
            const project = await Project.findOne({ slug: projectSlug })
                .select('_id name code deleted location description slug')
                .populate({
                    path: 'timesheets',
                    populate: [
                        { path: 'manager', select: '_id name' },
                        { path: 'members', select: '_id name' },
                        { path: 'timesheetDetails', populate: { path: 'leavers', select: '_id name' } },
                    ],
                })
                .lean()
                .exec();
            if (!project) throw new ApiError(404, `Porject was not found: ${projectSlug}`);
            if (project.deleted) throw new ApiError(406, `Project has been disabled`);

            return project;
        } catch (err) {
            throw err;
        }
    }

    // [POST] /v1/projects/:projectSlug/timesheet/upload-file
    async uploadFile(authUser, projectSlug, formData, files) {
        try {
            const { workDate, shift } = formData;

            const project = await projectService.getLeanProject(projectSlug);

            if (
                !project.manager.equals(authUser._id) &&
                !project.leaders.some((leader) => leader.equals(authUser.id)) &&
                !project.members.some((member) => member.equals(authUser._id))
            ) {
                throw new ApiError(403, 'You do not have permission to edit this timesheet');
            }

            // workDate isn't more than 10 days
            const tenDaysAgo = new Date().getTime() - 10 * 24 * 60 * 60 * 1000;
            if (
                new Date(workDate).getTime() < tenDaysAgo &&
                !project.manager.equals(authUser._id) &&
                authUser.role !== 'admin'
            ) {
                throw new ApiError(403, 'You are 10 days late. Please contact the project manager');
            }

            const monthYear = workDate.slice(0, 7);
            let timesheet = await Timesheet.findOne({ project: project._id, monthYear }).lean().exec();

            if (!timesheet) {
                timesheet = await Timesheet.create({
                    project: project._id,
                    manager: project.manager,
                    members: [...project.leaders, ...project.members],
                    startedAt: project.startedAt,
                    monthYear,
                });

                await Project.updateOne({ _id: project._id }, { $push: { timesheets: timesheet._id } });
            }

            const [timesheetDetail, proofs] = await Promise.all([
                TimesheetDetail.findOneAndUpdate(
                    { timesheet: timesheet._id, workDate, shift },
                    { $setOnInsert: { timesheet: timesheet._id, workDate, shift } },
                    { upsert: true, new: true },
                ).exec(),
                files.map((file) => ({
                    proofName: file.originalname,
                    proofUri: file.location,
                    isApproved: false,
                })),
            ]);

            timesheetDetail.proofs.push(...proofs);
            await timesheetDetail.save();

            const timesheetDetailIndex = timesheet.timesheetDetails.findIndex(
                (tsDetail) => tsDetail._id.toString() === timesheetDetail._id.toString(),
            );

            if (timesheetDetailIndex === -1) {
                await Timesheet.updateOne({ _id: timesheet._id }, { $push: { timesheetDetails: timesheetDetail._id } });
            }

            return timesheetDetail;
        } catch (err) {
            throw err;
        }
    }

    // [DELETE] /v1/projects/:projectSlug/timesheet/delete-file
    async deleteFile(authUser, formData) {
        try {
            const { timesheetDetailId, proofId } = formData;

            const timesheetDetail = await TimesheetDetail.findOne(
                { _id: timesheetDetailId, 'proofs._id': proofId },
                { 'proofs.$': 1 },
            )
                .populate('timesheet', 'manager members')
                .lean()
                .exec();

            if (!timesheetDetail) throw new ApiError(404, `TimesheetDetail or Document was not found`);

            if (
                !['admin'].includes(authUser.role) &&
                !timesheetDetail.timesheet.manager.equals(authUser._id) &&
                !timesheetDetail.timesheet.members.some((member) => member.equals(authUser._id))
            ) {
                throw new ApiError(403, 'You do not have persmission to edit this timesheet');
            }

            const proofKey = timesheetDetail.proofs[0].proofUri.split(`${config.S3_BUCKET}/`)[1];
            if (proofKey) await removeS3(proofKey);

            await TimesheetDetail.updateOne({ _id: timesheetDetailId }, { $pull: { proofs: { _id: proofId } } });
        } catch (err) {
            throw err;
        }
    }

    // [PUT] /v1/projects/:projectSlug/timesheet/review
    async reviewTimesheet(authUser, projectSlug, formData) {
        try {
            const { workDate, shift, comment, proofId, isApproved } = formData;

            const project = await projectService.getLeanProject(projectSlug);

            if (!project) throw new ApiError(404, `Porject was not found: ${projectSlug}`);

            if (
                !['admin'].includes(authUser.role) &&
                !project.manager.equals(authUser.id) &&
                !project.leaders.some((leader) => leader.equals(authUser.id))
            ) {
                throw new ApiError(403, 'You do not have permission to edit this timeheet.');
            }

            const monthYear = workDate.slice(0, 7);
            let timesheet = await Timesheet.findOne({ project: project._id, monthYear }).lean().exec();

            if (!timesheet) {
                timesheet = await Timesheet.create({
                    project: project._id,
                    manager: project.manager,
                    members: [...project.leaders, ...project.members],
                    startedAt: project.startedAt,
                    monthYear,
                });

                await Project.updateOne({ _id: project._id }, { $push: { timesheets: timesheet._id } });
            }

            let timesheetDetail = await TimesheetDetail.findOne({ timesheet: timesheet._id, workDate, shift }).exec();

            if (!timesheetDetail && comment) {
                timesheetDetail = await TimesheetDetail.create({ timesheet: timesheet._id, workDate, shift });

                await Timesheet.updateOne({ _id: timesheet._id }, { $push: { timesheetDetails: timesheetDetail._id } });
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

    // [PUT] /v1/projects/:projectSlug/timesheet/leave-members
    async leaveMembersTimesheet(authUser, projectSlug, formData) {
        try {
            const { timesheetDetailId, members } = formData;

            const [project, timesheetDetail] = await Promise.all([
                projectService.getLeanProject(projectSlug),
                TimesheetDetail.findById(timesheetDetailId).exec(),
            ]);

            if (!project) throw new ApiError(404, `Project was not found: ${projectSlug}`);

            if (
                !['admin'].includes(authUser.role) &&
                !project.manager.equals(authUser.id) &&
                !project.leaders.some((leader) => leader.equals(authUser.id))
            ) {
                throw new ApiError(403, 'You do not have permission to edit this timesheet');
            }

            const memberNotExists = members.filter(
                (memberID) =>
                    ![project.manager, ...project.leaders, ...project.members].some((id) => id.equals(memberID)),
            );

            if (memberNotExists.length > 0) {
                throw new ApiError(406, `User not in this project: ${memberNotExists}`);
            }

            timesheetDetail.leavers = members;
            await timesheetDetail.save();

            return timesheetDetail;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new TimesheetService();
