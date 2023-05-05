const express = require('express');
const router = express.Router();
const userController = require('../../app/controllers/UserController');
const filterModel = require('../../middlewares/FilterMiddleware');
const { authenticateToken } = require('../../middlewares/AuthMiddleware');

router.get('/:userSlug', authenticateToken, userController.getUserBySlug);
router.get('/', authenticateToken, filterModel('User'), userController.getAllUsers);

module.exports = router;
