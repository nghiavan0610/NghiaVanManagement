import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoRepository } from '@/shared/modules/mongo/mongo.repository';
import { Model } from 'mongoose';
import { Leave } from '../schemas/leave.schema';

@Injectable()
export class LeaveRepository extends MongoRepository<Leave> {
    constructor(@InjectModel(Leave.name) private readonly leaveRepository: Model<Leave>) {
        super(leaveRepository);
    }
}
