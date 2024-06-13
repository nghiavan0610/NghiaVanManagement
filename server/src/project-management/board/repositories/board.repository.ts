import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoRepository } from '@/shared/modules/mongo/mongo.repository';
import { Model } from 'mongoose';
import { Board } from '../schemas/board.schema';

@Injectable()
export class BoardRepository extends MongoRepository<Board> {
    constructor(@InjectModel(Board.name) private readonly boardRepository: Model<Board>) {
        super(boardRepository);
    }
}
