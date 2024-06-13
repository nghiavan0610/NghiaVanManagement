import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoRepository } from '@/shared/modules/mongo/mongo.repository';
import { Model } from 'mongoose';
import { Material } from '../schemas/material.schema';

@Injectable()
export class MaterialRepository extends MongoRepository<Material> {
    constructor(@InjectModel(Material.name) private readonly materialRepository: Model<Material>) {
        super(materialRepository);
    }
}
