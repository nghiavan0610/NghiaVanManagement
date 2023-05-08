const ctaService = require('../services/CtaService');
const stream = require('stream');

class CtaController {
    // [POST] /v1/activities/export
    async export(req, res, next) {
        try {
            const formData = req.body;
            const { buf, outputFilename } = await ctaService.export(formData);

            const readStream = new stream.PassThrough();
            readStream.end(buf);

            res.set('Content-disposition', 'attachment; filename=' + outputFilename);
            res.set('Content-Type', 'text/plain');

            readStream.pipe(res);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new CtaController();
