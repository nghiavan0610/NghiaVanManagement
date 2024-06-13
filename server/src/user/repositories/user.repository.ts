import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { MongoRepository } from '@/shared/modules/mongo/mongo.repository';
import { Model } from 'mongoose';

@Injectable()
export class UserRepository extends MongoRepository<User> {
    constructor(@InjectModel(User.name) private readonly userRepository: Model<User>) {
        super(userRepository);
    }
}
