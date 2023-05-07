const mongoose = require('mongoose');
const { ApiError } = require('../../helpers/ErrorHandler');
const { Job } = require('../../db/models');

class JobService {
    // [GET] /v1/jobs
    async getAllJobs() {
        try {
            const jobs = await Job.find().exec();
            return jobs;
        } catch (err) {
            throw err;
        }
    }

    // [GET] /v1/jobs/:jobSlug
    async getJobBySlug(jobSlug) {
        try {
            const job = await Job.findOne({ slug: jobSlug }).exec();
            if (!job) throw new ApiError(404, `Job was not found ${jobSlug}`);
            return job;
        } catch (err) {
            throw err;
        }
    }

    // [POST] /v1/jobs/create
    async createJob(formData) {
        try {
            const { name } = formData;
            const newJob = await Job.findOneAndUpdate({ name }, formData, {
                upsert: true,
                runValidators: true,
                new: true,
            }).exec();
            return newJob;
        } catch (err) {
            throw err;
        }
    }

    // [PUT] /v1/jobs/:jobId/edit
    async editJob(jobId, formData) {
        try {
            const newJob = await Job.findByIdAndUpdate(jobId, formData, {
                runValidators: true,
                new: true,
            });
            return newJob;
        } catch (err) {
            throw err;
        }
    }

    // [DELETE] /v1/jobs/:jobId/delete
    async deleteJob(jobId) {
        try {
            await Job.deleteOne({ _id: jobId });
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new JobService();
