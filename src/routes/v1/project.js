const express = require('express');
const router = express.Router();
const projectController = require('../../app/controllers/ProjectController');
const { authenticateToken } = require('../../middlewares/AuthMiddleware');
const requireRole = require('../../middlewares/RoleMiddleware');
const filterModel = require('../../middlewares/FilterMiddleware');

router.get('/:projectSlug', authenticateToken, projectController.getProjectBySlug);
router.get('/', authenticateToken, filterModel('Project'), projectController.getAllProjects);

module.exports = router;
