import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoRepository } from '@/shared/modules/mongo/mongo.repository';
import { Model } from 'mongoose';
import { Pillar } from '../schemas/pillar.schema';

@Injectable()
export class PillarRepository extends MongoRepository<Pillar> {
    constructor(@InjectModel(Pillar.name) private readonly pillarRepository: Model<Pillar>) {
        super(pillarRepository);
    }
}
