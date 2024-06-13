import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoRepository } from '@/shared/modules/mongo/mongo.repository';
import { Model } from 'mongoose';
import { Station } from '../schemas/station.schema';

@Injectable()
export class StationRepository extends MongoRepository<Station> {
    constructor(@InjectModel(Station.name) private readonly stationRepository: Model<Station>) {
        super(stationRepository);
    }
}
