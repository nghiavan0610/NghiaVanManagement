const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middlewares/AuthMiddleware');
const requireRole = require('../../middlewares/RoleMiddleware');
const jobController = require('../../app/controllers/JobController');

router.put('/:jobId/edit', authenticateToken, requireRole('admin'), jobController.editJob);
router.delete('/:jobId/delete', authenticateToken, requireRole('admin'), jobController.deleteJob);
router.post('/create', authenticateToken, requireRole('admin'), jobController.createJob);

router.get('/:jobSlug', authenticateToken, jobController.getJobBySlug);
router.get('/', authenticateToken, jobController.getAllJobs);

module.exports = router;
