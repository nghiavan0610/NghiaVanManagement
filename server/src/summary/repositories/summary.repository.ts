import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoRepository } from '@/shared/modules/mongo/mongo.repository';
import { Model } from 'mongoose';
import { Summary } from '../schemas/summary.schema';

@Injectable()
export class SummaryRepository extends MongoRepository<Summary> {
    constructor(@InjectModel(Summary.name) private readonly summaryRepository: Model<Summary>) {
        super(summaryRepository);
    }
}
