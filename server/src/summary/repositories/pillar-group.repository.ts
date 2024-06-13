import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoRepository } from '@/shared/modules/mongo/mongo.repository';
import { Model } from 'mongoose';
import { PillarGroup } from '../schemas/pillar-group.schema';

@Injectable()
export class PillarGroupRepository extends MongoRepository<PillarGroup> {
    constructor(@InjectModel(PillarGroup.name) private readonly pillarGroupRepository: Model<PillarGroup>) {
        super(pillarGroupRepository);
    }
}
