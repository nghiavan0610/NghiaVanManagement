const summaryService = require('../services/SummaryService');
const { response } = require('../../helpers/Response');

class SummaryController {
    // [POST] /v1/projects/:projectSlug/summary
    async handleSummary(req, res, next) {
        try {
            const authUser = req.user;
            const { projectSlug } = req.params;
            const formData = req.body;
            const summary = await summaryService.handleSummary(authUser, projectSlug, formData);
            res.status(201).json(response({ summary }));
        } catch (err) {
            next(err);
        }
    }

    // [POST] /v1/projects/:projectSlug/summary/download
    async downloadSummary(req, res, next) {
        try {
            const { projectSlug } = req.params;
            const authUser = req.user;
            const workbook = await summaryService.downloadSummary(authUser, projectSlug);
            workbook.write('workbook.xlsx', res);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new SummaryController();
