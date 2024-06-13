import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoRepository } from '@/shared/modules/mongo/mongo.repository';
import { Model } from 'mongoose';
import { Project } from '../schemas/project.schema';

@Injectable()
export class ProjectRepository extends MongoRepository<Project> {
    constructor(@InjectModel(Project.name) private readonly projectRepository: Model<Project>) {
        super(projectRepository);
    }
}
