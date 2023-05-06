const mongoose = require('mongoose');
const { ApiError } = require('../../helpers/ErrorHandler');
const models = require('../../db/models');

const checkMaterialType = (materialType) => {
    if (!models[materialType]) {
        throw new ApiError(404, `Invalid Material Type: ${materialType}`);
    }

    return models[materialType];
};

class MaterialService {
    // [GET] /v1/materials
    async getAllMaterials(pipeline, materialType) {
        try {
            const model = checkMaterialType(materialType);
            const materials = await model.aggregate(pipeline).exec();
            return materials;
        } catch (err) {
            throw err;
        }
    }

    // [GET] /v1/materials/:materialSlug
    async getMaterialBySlug(materialSlug, materialType) {
        try {
            const model = checkMaterialType(materialType);

            const material = await model.findOne({ slug: materialSlug }).exec();
            if (!material) throw new ApiError(404, `Material ${materialSlug} was not found`);

            return material;
        } catch (err) {
            throw err;
        }
    }

    // [POST] /v1/materials/create
    async createMaterial(formData) {
        try {
            const { name, materialType } = formData;

            const model = checkMaterialType(materialType);

            const newMaterial = await model
                .findOneAndUpdate(
                    { name },
                    { name },
                    {
                        upsert: true,
                        runValidators: true,
                        new: true,
                    },
                )
                .exec();

            return newMaterial;
        } catch (err) {
            throw err;
        }
    }

    // [PUT] /v1/materials/:materialId/edit
    async editMaterial(materialId, materialType, name) {
        try {
            const model = checkMaterialType(materialType);

            const newMaterial = await model
                .findByIdAndUpdate(materialId, name, {
                    runValidators: true,
                    new: true,
                })
                .exec();

            return newMaterial;
        } catch (err) {
            throw err;
        }
    }

    // [DELETE] /v1/materials/:materialId/delete
    async deleteMaterial(materialId, materialType) {
        try {
            const model = checkMaterialType(materialType);

            await model.deleteOne({ _id: materialId }).exec();
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new MaterialService();
