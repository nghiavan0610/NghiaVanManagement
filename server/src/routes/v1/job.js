const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middlewares/AuthMiddleware');
const requireRole = require('../../middlewares/RoleMiddleware');
const jobController = require('../../app/controllers/JobController');

router.post('/create-job', authenticateToken, requireRole('admin'), jobController.createJob);
router.put('/:jobId', authenticateToken, requireRole('admin'), jobController.editJob);
router.delete('/:jobId', authenticateToken, requireRole('admin'), jobController.deleteJob);
router.get('/:jobSlug', authenticateToken, jobController.getJobBySlug);
router.get('/', authenticateToken, jobController.getAllJobs);

module.exports = router;
