import { CreateMaterialDto } from '../dtos/request/create-material.dto';
import { MaterialDetailResponseDataDto } from '../dtos/response/material-detail-response.dto';
import { UpdateMaterialDto } from '../dtos/request/update-material.dto';
import { GetMaterialListByCategoryDto } from '../dtos/request/get-material-list-by-category.dto';
import { Material } from '../schemas/material.schema';

export interface IMaterialService {
    deleteMaterial(id: string): Promise<boolean>;
    updateMaterial(updateMaterialDto: UpdateMaterialDto): Promise<boolean>;
    getMaterialDetail(id: string): Promise<MaterialDetailResponseDataDto>;
    getMaterialList(filters: GetMaterialListByCategoryDto): Promise<MaterialDetailResponseDataDto[]>;
    createMaterial(createMaterialDto: CreateMaterialDto): Promise<MaterialDetailResponseDataDto>;
    // ============================ START COMMON FUNCTION ============================
    _getMaterialByName(name: string): Promise<Material>;
    _createMaterial(doc: Material | any): Promise<Material>;
    _getMaterialById(id: string): Promise<Material>;
    // ============================ END COMMON FUNCTION ============================
}

export const IMaterialService = Symbol('IMaterialService');
