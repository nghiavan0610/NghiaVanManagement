const express = require('express');
const router = express.Router();
const userController = require('../../app/controllers/UserController');
const filterModel = require('../../middlewares/FilterMiddleware');
const { authenticateToken } = require('../../middlewares/AuthMiddleware');
const requireRole = require('../../middlewares/RoleMiddleware');

router.post('/create-user', authenticateToken, requireRole('admin', 'manager'), userController.createUser);

router.get('/:userSlug', authenticateToken, userController.getUserBySlug);
router.get('/', authenticateToken, filterModel('User'), userController.getAllUsers);

module.exports = router;
