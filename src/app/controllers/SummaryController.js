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
}

module.exports = new SummaryController();
