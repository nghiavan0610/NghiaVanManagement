const express = require('express');
const router = express.Router();
const projectController = require('../../app/controllers/ProjectController');
const { authenticateToken } = require('../../middlewares/AuthMiddleware');
const requireRole = require('../../middlewares/RoleMiddleware');

router.get('/:projectSlug', authenticateToken, projectController.getProjectBySlug);

module.exports = router;
