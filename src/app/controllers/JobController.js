const jobService = require('../services/JobService');
const { response } = require('../../helpers/Response');

class JobController {
    // [GET] /v1/jobs
    async getAllJobs(req, res, next) {
        try {
            const jobs = await jobService.getAllJobs();
            res.status(200).json(response({ jobs }));
        } catch (err) {
            next(err);
        }
    }

    // [GET] /v1/jobs/:jobSlug
    async getJobBySlug(req, res, next) {
        try {
            const { jobSlug } = req.params;
            const job = await jobService.getJobBySlug(jobSlug);
            res.status(200).json(response(job));
        } catch (err) {
            next(err);
        }
    }

    // [POST] /v1/jobs/create
    async createJob(req, res, next) {
        try {
            const formData = req.body;
            const newJob = await jobService.createJob(formData);
            res.status(201).json(response({ newJob }));
        } catch (err) {
            next(err);
        }
    }

    // [PUT] /v1/jobs/:jobId/edit
    async editJob(req, res, next) {
        try {
            const { jobId } = req.params;
            const formData = req.body;
            const newJob = await jobService.editJob(jobId, formData);
            res.status(201).json(response({ newJob }));
        } catch (err) {
            next(err);
        }
    }

    // [DELETE] /v1/jobs/:jobId/delete
    async deleteJob(req, res, next) {
        try {
            const { jobId } = req.params;
            await jobService.deleteJob(jobId);
            res.status(200).json(response('The job has been deleted'));
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new JobController();
