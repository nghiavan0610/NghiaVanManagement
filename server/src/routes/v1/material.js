const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middlewares/AuthMiddleware');
const filterModel = require('../../middlewares/FilterMiddleware');
const materialController = require('../../app/controllers/MaterialController');

router.post('/create-material', authenticateToken, materialController.createMaterial);
router.put('/:materialId', authenticateToken, materialController.editMaterial);
router.delete('/:materialId', authenticateToken, materialController.deleteMaterial);
router.get('/:materialSlug', authenticateToken, materialController.getMaterialBySlug);
router.get('/', authenticateToken, filterModel('Material', false, false), materialController.getAllMaterials);

module.exports = router;
