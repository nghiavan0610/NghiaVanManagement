const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middlewares/AuthMiddleware');
const ctaController = require('../../app/controllers/CtaController');

router.post('/export', authenticateToken, ctaController.export);

module.exports = router;
