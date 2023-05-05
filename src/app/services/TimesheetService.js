const { ApiError } = require('../../helpers/ErrorHandler');
const { User, Project, Job, Timesheet, TimesheetDetail } = require('../../db/models');

class TimesheetService {
    // [GET] /api/v1/projects/:projectSlug/timesheet
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
}

module.exports = new TimesheetService();
