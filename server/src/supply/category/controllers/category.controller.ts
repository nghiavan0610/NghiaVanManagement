import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, UseGuards } from '@nestjs/common';
import { ICategoryService } from '../services/category-service.interface';
import { CategoryListResponseDto } from '../dtos/response/category-list-response.dto';
import { BadRequestResponseDto } from '@/shared/dtos/response/bad-request-response.dto';
import { ApiOperation, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { Roles } from '@/shared/decorators/role.decorator';
import { RolesGuard } from '@/shared/guards/role.guard';
import { CreateCategoryDto } from '../dtos/request/create-category.dto';
import { CreateCategoryResponseDto } from '../dtos/response/create-category-response.dto';

@Controller('categories')
export class CategoryController {
    constructor(@Inject(ICategoryService) private readonly categoryService: ICategoryService) {}

    // [GET] /categories
    @Roles('admin', 'manager')
    @UseGuards(RolesGuard)
    @Get()
    @ApiOperation({ summary: 'Get Category List.' })
    @ApiOkResponse({ type: CategoryListResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async getCategoryList(): Promise<CategoryListResponseDto> {
        const result = await this.categoryService.getCategoryList();

        return new CategoryListResponseDto(result);
    }

    // [POST] /categories
    @Roles('admin', 'manager')
    @UseGuards(RolesGuard)
    @Post()
    @ApiOperation({ summary: 'Create Category.' })
    @ApiOkResponse({ type: CreateCategoryResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.CREATED)
    async createCategory(@Body() createCategoryDto: CreateCategoryDto): Promise<CreateCategoryResponseDto> {
        const result = await this.categoryService.createCategory(createCategoryDto);

        return new CreateCategoryResponseDto(result);
    }
}
