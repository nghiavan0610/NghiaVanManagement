const express = require('express');
const router = express.Router();
const userController = require('../../app/controllers/UserController');
const filterModel = require('../../middlewares/FilterMiddleware');
const { authenticateToken } = require('../../middlewares/AuthMiddleware');
const requireRole = require('../../middlewares/RoleMiddleware');

router.post('/create', authenticateToken, requireRole('admin', 'manager'), userController.createUser);
router.put('/:userSlug/edit-account', authenticateToken, userController.updateUserAccount);
router.put('/:userSlug/edit-security', authenticateToken, userController.updateUserSecurity);
router.post('/:userSlug/delete', authenticateToken, requireRole('admin', 'manager'), userController.deleteUser);
router.patch('/:userSlug/restore', authenticateToken, requireRole('admin'), userController.restoreUser);
router.post('/:userSlug/force-delete', authenticateToken, requireRole('admin'), userController.forceDeleteUser);

router.get('/my-projects', authenticateToken, userController.getUserProjects);
router.get('/:userSlug', authenticateToken, userController.getUserBySlug);
router.get('/', authenticateToken, filterModel('User'), userController.getAllUsers);

module.exports = router;
