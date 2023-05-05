const projectService = require('../services/ProjectService');
const { response } = require('../../helpers/Response');

class ProjectController {
    // [GET] /v1/projects
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

    // [GET] /v1/projects/:projectSlug
    async getProjectBySlug(req, res, next) {
        try {
            const { projectSlug } = req.params;
            const project = await projectService.getProjectBySlug(projectSlug);
            res.status(200).json(response({ project }));
        } catch (err) {
            next(err);
        }
    }

    // [POST] /v1/projects/create
    async createProject(req, res, next) {
        try {
            const authUser = req.user;
            const formData = req.body;
            const newProject = await projectService.createProject(authUser, formData);
            res.status(201).json(response({ newProject }));
        } catch (err) {
            next(err);
        }
    }

    // [PUT] /v1/projects/:projectSlug/edit
    async updateProject(req, res, next) {
        try {
            const formData = req.body;
            const { projectSlug } = req.params;
            const authUser = req.user;
            const updatedProject = await projectService.updateProject(projectSlug, formData, authUser);
            res.status(201).json(response({ updatedProject }));
        } catch (err) {
            next(err);
        }
    }

    // [DELETE] /v1/projects/:projectSlug/delete
    async deleteProject(req, res, next) {
        try {
            const authUser = req.user;
            const { projectSlug } = req.params;
            await projectService.deleteProject(authUser, projectSlug);
            res.status(200).json(response('Project has been deleted'));
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new ProjectController();
