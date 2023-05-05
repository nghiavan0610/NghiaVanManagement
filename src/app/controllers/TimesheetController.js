const { response } = require('../../helpers/Response');
const { ApiError } = require('../../helpers/ErrorHandler');
const timesheetService = require('../services/TimesheetService');

class TimesheetController {
    // [GET] /api/v1/projects/:projectSlug/timesheet
    async getTimesheet(req, res, next) {
        try {
            const { projectSlug } = req.params;
            const project = await timesheetService.getTimesheet(projectSlug);
            res.status(200).json(response({ project }));
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new TimesheetController();
