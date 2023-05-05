const projectService = require('../services/ProjectService');
const { response } = require('../../helpers/Response');

class ProjectController {
    // [GET] /api/v1/projects
    async getAllProjects(req, res, next) {
        try {
            const pipeline = req.pipeline;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await projectService.getAllProjects(pipeline, page, limit);
            res.status(200).json(response(result));
        } catch (err) {
            next(err);
        }
    }

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
