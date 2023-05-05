const projectService = require('../services/ProjectService');
const { response } = require('../../helpers/Response');

class ProjectController {
    // [GET] /api/v1/projects/:projectSlug
    async getProjectBySlug(req, res, next) {
        try {
            const { projectSlug } = req.params;
            const project = await projectService.getProjectBySlug(projectSlug);
            res.status(200).json(response({ project }));
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new ProjectController();
