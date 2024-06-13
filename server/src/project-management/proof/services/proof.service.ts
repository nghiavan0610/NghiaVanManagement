import { Injectable } from '@nestjs/common';
import { IProofService } from './proof-service.interface';
import { Proof } from '../schemas/proof.schema';
import { ProofRepository } from '../repositories/proof.repository';
import {
    FilterQuery,
    ProjectionType,
    QueryOptions,
    UpdateQuery,
    UpdateWithAggregationPipeline,
    UpdateWriteOpResult,
} from 'mongoose';

@Injectable()
export class ProofService implements IProofService {
    constructor(private readonly proofRepository: ProofRepository) {}
    // ============================ START COMMON FUNCTION ============================
    async _deleteProof(
        filter: FilterQuery<Proof>,
        options?: any,
    ): Promise<{
        deletedCount: number;
    }> {
        return this.proofRepository.deleteOne(filter, options);
    }

    async _updateManyProof(
        filter?: FilterQuery<Proof>,
        update?: UpdateWithAggregationPipeline | UpdateQuery<Proof>,
        options?: any,
    ): Promise<UpdateWriteOpResult> {
        return this.proofRepository.updateMany(filter, update, options);
    }

    async _updateOneProof(
        filter: FilterQuery<Proof>,
        update: UpdateQuery<Proof>,
        options?: any,
    ): Promise<UpdateWriteOpResult> {
        return this.proofRepository.updateOne(filter, update, options);
    }

    async _findByIdProof(
        id: string,
        projection?: ProjectionType<Proof>,
        options?: QueryOptions<Proof>,
    ): Promise<Proof> {
        return this.proofRepository.findById(id, projection, options);
    }

    async _createProof(doc: Proof | any): Promise<Proof> {
        return this.proofRepository.create(doc);
    }
    // ============================ END COMMON FUNCTION ============================
}
