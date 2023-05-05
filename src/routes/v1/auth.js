const express = require('express');
const router = express.Router();

const authController = require('../../app/controllers/AuthController');

router.post('/signin', authController.signin);
// router.post('/refresh-token', authController.createNewAccessToken);
// router.get('/signout', authenticateToken, authController.signout);

module.exports = router;
