const express = require('express');
const router = express.Router();
const projectController = require('../../app/controllers/ProjectController');
const { authenticateToken } = require('../../middlewares/AuthMiddleware');
const requireRole = require('../../middlewares/RoleMiddleware');
const filterModel = require('../../middlewares/FilterMiddleware');
const timesheetController = require('../../app/controllers/TimesheetController');

// Timesheet
router.get('/:projectSlug/timesheet', authenticateToken, timesheetController.getTimesheet);

// Porject
router.post('/create', authenticateToken, requireRole('admin', 'manager'), projectController.createProject);
router.put('/:projectSlug/edit', authenticateToken, requireRole('admin', 'manager'), projectController.updateProject);
router.delete(
    '/:projectSlug/delete',
    authenticateToken,
    requireRole('admin', 'manager'),
    projectController.deleteProject,
);

router.get('/:projectSlug', authenticateToken, projectController.getProjectBySlug);
router.get('/', authenticateToken, filterModel('Project'), projectController.getAllProjects);

module.exports = router;
