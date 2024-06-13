import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoRepository } from '@/shared/modules/mongo/mongo.repository';
import { Model } from 'mongoose';
import { Proof } from '../schemas/proof.schema';

@Injectable()
export class ProofRepository extends MongoRepository<Proof> {
    constructor(@InjectModel(Proof.name) private readonly proofRepository: Model<Proof>) {
        super(proofRepository);
    }
}
