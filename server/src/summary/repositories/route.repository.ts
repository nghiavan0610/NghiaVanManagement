import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoRepository } from '@/shared/modules/mongo/mongo.repository';
import { Model } from 'mongoose';
import { Route } from '../schemas/route.schema';

@Injectable()
export class RouteRepository extends MongoRepository<Route> {
    constructor(@InjectModel(Route.name) private readonly routeRepository: Model<Route>) {
        super(routeRepository);
    }
}
