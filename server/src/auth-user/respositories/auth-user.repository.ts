import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AuthUser } from '../schemas/auth-user.schema';
import { MongoRepository } from '@/shared/modules/mongo/mongo.repository';
import { Model } from 'mongoose';

@Injectable()
export class AuthUserRepository extends MongoRepository<AuthUser> {
    constructor(@InjectModel(AuthUser.name) private readonly authUserRepository: Model<AuthUser>) {
        super(authUserRepository);
    }
}
