import { Inject, Injectable } from '@nestjs/common';
import { ICategoryService } from './category-service.interface';
import { CategoryDetailResponseDataDto } from '../dtos/response/category-detail-response.dto';
import { CategoryRepository } from '../repositories/category.repository';
import { ILoggerService } from '@/shared/modules/logger/services/logger-service.interface';
import { FilterQuery } from 'mongoose';
import { Category } from '../schemas/category.schema';
import { CreateCategoryDto } from '../dtos/request/create-category.dto';

@Injectable()
export class CategoryService implements ICategoryService {
    constructor(
        private readonly categoryRepository: CategoryRepository,
        @Inject(ILoggerService) private readonly logger: ILoggerService,
    ) {}

    // [GET] /categories
    async getCategoryList(): Promise<CategoryDetailResponseDataDto[]> {
        this.logger.info('[GET CATEGORY LIST]');

        return this._getCategoryList();
    }

    // [POST] /categories
    async createCategory(createCategoryDto: CreateCategoryDto): Promise<CategoryDetailResponseDataDto> {
        this.logger.info('[CREATE CATEGORY], createCategoryDto', createCategoryDto);

        // Already check existed name in Dto

        return this.categoryRepository.create(createCategoryDto);
    }

    // ============================ START COMMON FUNCTION ============================
    async _getCategoryForValidate(filter: FilterQuery<Category>, exceptId?: string): Promise<Category> {
        const query = exceptId ? { _id: { $ne: exceptId }, ...filter } : { ...filter };

        return this.categoryRepository.findOne(query);
    }

    async _getCategoryList(): Promise<Category[]> {
        return this.categoryRepository.findAll();
    }

    async _getCategoryById(id: string): Promise<Category> {
        return this.categoryRepository.findById(id);
    }
    // ============================ END COMMON FUNCTION ============================
}
