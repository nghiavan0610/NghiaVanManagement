const express = require('express');
const router = express.Router();
const projectController = require('../../app/controllers/ProjectController');
const { authenticateToken } = require('../../middlewares/AuthMiddleware');
const requireRole = require('../../middlewares/RoleMiddleware');
const filterModel = require('../../middlewares/FilterMiddleware');
const timesheetController = require('../../app/controllers/TimesheetController');
const { uploadS3 } = require('../../middlewares/S3Middleware');
const summaryController = require('../../app/controllers/SummaryController');

// Timesheet
router.post(
    '/:projectSlug/timesheet/upload-file',
    authenticateToken,
    uploadS3.array('proof', 10),
    timesheetController.uploadFile,
);
router.post('/:projectSlug/timesheet/delete-file', authenticateToken, timesheetController.deleteFile);
router.post('/:projectSlug/timesheet/download', authenticateToken, timesheetController.downloadTimesheet);
router.put('/:projectSlug/timesheet/review', authenticateToken, timesheetController.reviewTimesheet);
router.put('/:projectSlug/timesheet/leave-members', authenticateToken, timesheetController.leaveMembersTimesheet);
router.get('/:projectSlug/timesheet', authenticateToken, timesheetController.getTimesheet);

// Summary
router.post(
    '/:projectSlug/summary/upload',
    authenticateToken,
    uploadS3.single('excel'),
    summaryController.uploadSummary,
);
router.post('/:projectSlug/summary/download', authenticateToken, summaryController.downloadSummary);
router.post('/:projectSlug/summary', authenticateToken, summaryController.handleSummary);

// Project
router.put('/:projectSlug', authenticateToken, requireRole('admin', 'manager'), projectController.updateProject);
router.delete('/:projectSlug', authenticateToken, requireRole('admin', 'manager'), projectController.deleteProject);
router.post('/create-project', authenticateToken, requireRole('admin', 'manager'), projectController.createProject);

router.get('/:projectSlug', authenticateToken, projectController.getProjectBySlug);
router.get('/', authenticateToken, filterModel('Project'), projectController.getAllProjects);

module.exports = router;
