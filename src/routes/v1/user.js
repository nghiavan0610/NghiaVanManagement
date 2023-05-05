const express = require('express');
const router = express.Router();
const userController = require('../../app/controllers/UserController');

router.get('/:userSlug', userController.getUserBySlug);

module.exports = router;
