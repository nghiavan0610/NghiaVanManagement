import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoRepository } from '@/shared/modules/mongo/mongo.repository';
import { Model } from 'mongoose';
import { Comment } from '../schemas/comment.schema';

@Injectable()
export class CommentRepository extends MongoRepository<Comment> {
    constructor(@InjectModel(Comment.name) private readonly commentRepository: Model<Comment>) {
        super(commentRepository);
    }
}
