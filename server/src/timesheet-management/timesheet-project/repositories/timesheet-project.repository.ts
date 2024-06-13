import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoRepository } from '@/shared/modules/mongo/mongo.repository';
import { Model } from 'mongoose';
import { TimesheetProject } from '../schemas/timesheet-project.schema';

@Injectable()
export class TimesheetProjectRepository extends MongoRepository<TimesheetProject> {
    constructor(
        @InjectModel(TimesheetProject.name) private readonly timesheetProjectRepository: Model<TimesheetProject>,
    ) {
        super(timesheetProjectRepository);
    }
}
