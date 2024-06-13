import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoRepository } from '@/shared/modules/mongo/mongo.repository';
import { Model } from 'mongoose';
import { PillarMaterial } from '../schemas/pillar-material.schema';

@Injectable()
export class PillarMaterialRepository extends MongoRepository<PillarMaterial> {
    constructor(@InjectModel(PillarMaterial.name) private readonly pillarMaterialRepository: Model<PillarMaterial>) {
        super(pillarMaterialRepository);
    }
}
