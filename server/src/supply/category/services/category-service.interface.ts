import { FilterQuery } from 'mongoose';
import { CreateCategoryDto } from '../dtos/request/create-category.dto';
import { CategoryDetailResponseDataDto } from '../dtos/response/category-detail-response.dto';
import { Category } from '../schemas/category.schema';

export interface ICategoryService {
    getCategoryList(): Promise<CategoryDetailResponseDataDto[]>;
    createCategory(createCategoryDto: CreateCategoryDto): Promise<CategoryDetailResponseDataDto>;
    // ============================ START COMMON FUNCTION ============================
    _getCategoryForValidate(filter: FilterQuery<Category>, exceptId?: string): Promise<Category>;
    _getCategoryById(id: string): Promise<Category>;
    _getCategoryList(): Promise<Category[]>;
    // ============================ END COMMON FUNCTION ============================
}

export const ICategoryService = Symbol('ICategoryService');
