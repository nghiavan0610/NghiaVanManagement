const express = require('express');
const router = express.Router();
const userController = require('../../app/controllers/UserController');
const { authenticateToken } = require('../../middlewares/AuthMiddleware');

router.get('/:userSlug', authenticateToken, userController.getUserBySlug);

module.exports = router;
