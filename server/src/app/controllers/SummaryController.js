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

    // [POST] /v1/projects/:projectSlug/summary/upload
    async uploadSummary(req, res, next) {
        try {
            const authUser = req.user;
            const formData = req.body;
            const { projectSlug } = req.params;

            const file = req.file;
            if (!file) throw new ApiError(404, 'Vui lòng tải lên tệp tin của bạn');

            const summary = await summaryService.uploadSummary(authUser, projectSlug, formData, file);
            res.status(200).json(response({ summary }));
        } catch (err) {
            if (req.file) await removeS3(req.file.key);

            next(err);
        }
    }
}

module.exports = new SummaryController();
