const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middlewares/AuthMiddleware');
const filterModel = require('../../middlewares/FilterMiddleware');
const materialController = require('../../app/controllers/MaterialController');

router.put('/:materialId/edit', authenticateToken, materialController.editMaterial);
router.delete('/:materialId/delete', authenticateToken, materialController.deleteMaterial);
router.post('/create', authenticateToken, materialController.createMaterial);

router.get('/:materialSlug', authenticateToken, materialController.getMaterialBySlug);
router.get('/', authenticateToken, filterModel('Material', false), materialController.getAllMaterials);

module.exports = router;
