import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IMaterialService } from './material-service.interface';
import { FilterQuery, ProjectionType, QueryOptions } from 'mongoose';
import { Material } from '../schemas/material.schema';
import { MaterialRepository } from '../repositories/material.repository';
import { ILoggerService } from '@/shared/modules/logger/services/logger-service.interface';
import { CreateMaterialDto } from '../dtos/request/create-material.dto';
import { MaterialDetailResponseDataDto } from '../dtos/response/material-detail-response.dto';
import { CustomException } from '@/shared/exceptions/custom.exception';
import { MaterialError } from '../enums/material-error.enum';
import { UpdateMaterialDto } from '../dtos/request/update-material.dto';
import { GetMaterialListByCategoryDto } from '../dtos/request/get-material-list-by-category.dto';
import { CommonError } from '@/shared/enums/common-error.enum';

@Injectable()
export class MaterialService implements IMaterialService {
    constructor(
        private readonly materialRepository: MaterialRepository,
        @Inject(ILoggerService) private readonly logger: ILoggerService,
    ) {}

    // [DELETE] /materials/:id
    async deleteMaterial(id: string): Promise<boolean> {
        this.logger.info('[DELETE MATERIAL] id', id);

        const material = await this._getMaterialById(id);
        if (!material) {
            throw new CustomException({
                message: MaterialError.MATERIAL_NOT_FOUND,
                statusCode: HttpStatus.NOT_FOUND,
            });
        }

        const deleted = await this.materialRepository.deleteOne({ _id: id });

        return deleted.deletedCount === 1 ? true : false;
    }

    // [PUT] /materials/:id
    async updateMaterial(updateMaterialDto: UpdateMaterialDto): Promise<boolean> {
        this.logger.info('[UPDATE MATERIAL] updateMaterialDto', updateMaterialDto);

        const { id, ...restDto } = updateMaterialDto;

        const material = await this._getMaterialById(id);
        if (!material) {
            throw new CustomException({
                message: MaterialError.MATERIAL_NOT_FOUND,
                statusCode: HttpStatus.NOT_FOUND,
            });
        }

        // Check existed material
        const existed = await this.materialRepository.findOne({ name: restDto.name, category: material.category });
        if (existed) {
            throw new CustomException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: MaterialError.MATERIAL_NAME_EXISTED,
            });
        }

        const result = await this.materialRepository.updateOne({ _id: id }, restDto);
        if (result.modifiedCount !== 1) {
            throw new CustomException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: CommonError.SOMETHING_WRONG_WHEN_UPDATE,
            });
        }

        return true;
    }

    // [GET] /materials/:id
    async getMaterialDetail(id: string): Promise<MaterialDetailResponseDataDto> {
        this.logger.info('[GET MATERIAL DETAIL BY ID] id', id);

        const material = await this._getMaterialById(id);
        if (!material) {
            throw new CustomException({
                message: MaterialError.MATERIAL_NOT_FOUND,
                statusCode: HttpStatus.NOT_FOUND,
            });
        }

        return material;
    }

    // [GET] /materials?categoryId=
    async getMaterialList(filters: GetMaterialListByCategoryDto): Promise<MaterialDetailResponseDataDto[]> {
        this.logger.info('[GET MATERIAL LIST BY CATEGORY], filters', filters);

        const filter: any = {};

        if (filters?.categoryId) {
            filter.category = filters.categoryId;
        }

        return this._getMaterialList(filter);
    }

    // [POST] /materials
    async createMaterial(createMaterialDto: CreateMaterialDto): Promise<MaterialDetailResponseDataDto> {
        this.logger.info('[CREATE MATERIAL], createMaterialDto', createMaterialDto);

        const { name, categoryId } = createMaterialDto;

        const existed = await this.materialRepository.findOne({
            name: name,
            category: categoryId,
        });
        if (existed) {
            throw new CustomException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: MaterialError.MATERIAL_EXISTED,
            });
        }

        return this._createMaterial({
            name: name,
            category: categoryId,
        });
    }

    // ============================ START COMMON FUNCTION ============================
    async _getMaterialByName(name: string): Promise<Material> {
        return this.materialRepository.findOne({ name });
    }

    async _getMaterialList(
        filter: FilterQuery<Material>,
        projection?: ProjectionType<Material>,
        options?: QueryOptions<Material>,
    ): Promise<Material[]> {
        return this.materialRepository.findAll(filter, projection, options);
    }

    async _createMaterial(doc: Material | any): Promise<Material> {
        return this.materialRepository.create(doc);
    }

    async _getMaterialById(id: string): Promise<Material> {
        return this.materialRepository.findById(id);
    }
    // ============================ END COMMON FUNCTION ============================
}
