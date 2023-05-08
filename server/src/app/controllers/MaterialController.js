const materialService = require('../services/MaterialService');
const { response } = require('../../helpers/Response');

class CcPillarController {
    // [GET] /v1/materials
    async getAllMaterials(req, res, next) {
        try {
            const pipeline = req.pipeline;
            const { materialType } = req.query;
            const materials = await materialService.getAllMaterials(pipeline, materialType);
            res.status(200).json(response({ [materialType]: materials }));
        } catch (err) {
            next(err);
        }
    }

    // [GET] /v1/materials/:materialSlug
    async getMaterialBySlug(req, res, next) {
        try {
            const { materialSlug } = req.params;
            const { materialType } = req.query;
            const material = await materialService.getMaterialBySlug(materialSlug, materialType);
            res.status(200).json(response({ [materialType]: material }));
        } catch (err) {
            next(err);
        }
    }

    // [POST] /v1/materials/create
    async createMaterial(req, res, next) {
        try {
            const formData = req.body;
            const newMaterial = await materialService.createMaterial(formData);
            res.status(201).json(response({ [formData.materialType]: newMaterial }));
        } catch (err) {
            next(err);
        }
    }

    // [PUT] /v1/materials/:materialId/edit
    async editMaterial(req, res, next) {
        try {
            const { materialId } = req.params;
            const { materialType } = req.query;
            const name = req.body;
            const newMaterial = await materialService.editMaterial(materialId, materialType, name);
            res.status(201).json(response({ [materialType]: newMaterial }));
        } catch (err) {
            next(err);
        }
    }

    // [DELETE] /v1/materials/:materialId/delete
    async deleteMaterial(req, res, next) {
        try {
            const { materialId } = req.params;
            const { materialType } = req.query;
            await materialService.deleteMaterial(materialId, materialType);
            res.status(200).json(response('Material has been deleted'));
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new CcPillarController();
