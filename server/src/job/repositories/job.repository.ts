import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from '../schemas/job.schema';
import { MongoRepository } from '@/shared/modules/mongo/mongo.repository';
import { Model } from 'mongoose';

@Injectable()
export class JobRepository extends MongoRepository<Job> {
    constructor(@InjectModel(Job.name) private readonly jobRepository: Model<Job>) {
        super(jobRepository);
    }
}
