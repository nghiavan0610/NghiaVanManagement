import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoRepository } from '@/shared/modules/mongo/mongo.repository';
import { Model } from 'mongoose';
import { PillarCategory } from '../schemas/pillar-category.schema';

@Injectable()
export class PillarCategoryRepository extends MongoRepository<PillarCategory> {
    constructor(@InjectModel(PillarCategory.name) private readonly pillarCategoryRepository: Model<PillarCategory>) {
        super(pillarCategoryRepository);
    }
}
