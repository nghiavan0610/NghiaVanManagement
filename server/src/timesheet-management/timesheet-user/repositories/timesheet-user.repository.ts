import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoRepository } from '@/shared/modules/mongo/mongo.repository';
import { Model } from 'mongoose';
import { TimesheetUser } from '../schemas/timesheet-user.schema';

@Injectable()
export class TimesheetUserRepository extends MongoRepository<TimesheetUser> {
    constructor(@InjectModel(TimesheetUser.name) private readonly timesheetUserRepository: Model<TimesheetUser>) {
        super(timesheetUserRepository);
    }
}
