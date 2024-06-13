import { Category } from './../schemas/category.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoRepository } from '@/shared/modules/mongo/mongo.repository';
import { Model } from 'mongoose';

@Injectable()
export class CategoryRepository extends MongoRepository<Category> {
    constructor(@InjectModel(Category.name) private readonly categoryRepository: Model<Category>) {
        super(categoryRepository);
    }
}
