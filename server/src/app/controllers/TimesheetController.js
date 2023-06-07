const { response } = require('../../helpers/Response');
const { ApiError } = require('../../helpers/ErrorHandler');
const timesheetService = require('../services/TimesheetService');
const { removeS3 } = require('../../middlewares/S3Middleware');

class TimesheetController {
    // [GET] /v1/projects/:projectSlug/timesheet
    async getTimesheet(req, res, next) {
        try {
            const { projectSlug } = req.params;
            const project = await timesheetService.getTimesheet(projectSlug);
            res.status(200).json(response({ project }));
        } catch (err) {
            next(err);
        }
    }

    // [POST] /v1/projects/:projectSlug/timesheet/upload-file
    async uploadFile(req, res, next) {
        try {
            const authUser = req.user;
            const { projectSlug } = req.params;
            const formData = req.body;
            const files = req.files;

            if (files.length === 0) {
                throw new ApiError(404, 'Please upload your files');
            }

            const timesheetDetail = await timesheetService.uploadFile(authUser, projectSlug, formData, files);
            res.status(201).json(response({ timesheetDetail }));
        } catch (err) {
            if (req.files.length !== 0) {
                for (const file of req.files) {
                    await removeS3(file.key);
                }
            }
            next(err);
        }
    }

    // [POST] /v1/projects/:projectSlug/timesheet/delete-file
    async deleteFile(req, res, next) {
        try {
            const authUser = req.user;
            const formData = req.body;
            await timesheetService.deleteFile(authUser, formData);
            res.status(200).json(response('Document has been deleted'));
        } catch (err) {
            next(err);
        }
    }

    // [PUT] /v1/projects/:projectSlug/timesheet/review
    async reviewTimesheet(req, res, next) {
        try {
            const authUser = req.user;
            const { projectSlug } = req.params;
            const formData = req.body;
            const timesheetDetail = await timesheetService.reviewTimesheet(authUser, projectSlug, formData);
            res.status(201).json(response({ timesheetDetail }));
        } catch (err) {
            next(err);
        }
    }

    // [PUT] /v1/projects/:projectSlug/timesheet/leave-members
    async leaveMembersTimesheet(req, res, next) {
        try {
            const authUser = req.user;
            const { projectSlug } = req.params;
            const formData = req.body;
            const timesheetDetail = await timesheetService.leaveMembersTimesheet(authUser, projectSlug, formData);
            res.status(201).json(response({ timesheetDetail }));
        } catch (err) {
            next(err);
        }
    }

    // [POST] /v1/projects/:projectSlug/timesheet/download
    async downloadTimesheet(req, res, next) {
        try {
            const authUser = req.user;
            const formData = req.body;
            const workbook = await timesheetService.downloadTimesheet(authUser, formData);
            workbook.write('timesheet.xlsx', res);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new TimesheetController();
