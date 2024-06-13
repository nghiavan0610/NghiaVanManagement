import { Module } from '@nestjs/common';
import { CategoryServiceProvider } from './providers/material.provider';
import { CategoryController } from './controllers/category.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './schemas/category.schema';
import { CategoryRepository } from './repositories/category.repository';
import { ICategoryService } from './services/category-service.interface';
import { IsUniqueCategoryName } from './validators/category-name.validator';
import { CategorySeeder } from './seeders/category.seeder';

@Module({
    imports: [MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }])],
    controllers: [CategoryController],
    providers: [CategoryServiceProvider, CategoryRepository, IsUniqueCategoryName, CategorySeeder],
    exports: [ICategoryService, CategorySeeder],
})
export class CategoryModule {}
