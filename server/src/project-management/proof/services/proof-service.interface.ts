import {
    FilterQuery,
    ProjectionType,
    QueryOptions,
    UpdateQuery,
    UpdateWithAggregationPipeline,
    UpdateWriteOpResult,
} from 'mongoose';
import { Proof } from '../schemas/proof.schema';

export interface IProofService {
    // ============================ START COMMON FUNCTION ============================
    _deleteProof(
        filter: FilterQuery<Proof>,
        options?: any,
    ): Promise<{
        deletedCount: number;
    }>;
    _updateManyProof(
        filter?: FilterQuery<Proof>,
        update?: UpdateWithAggregationPipeline | UpdateQuery<Proof>,
        options?: any,
    ): Promise<UpdateWriteOpResult>;
    _updateOneProof(
        filter: FilterQuery<Proof>,
        update: UpdateQuery<Proof>,
        options?: any,
    ): Promise<UpdateWriteOpResult>;
    _findByIdProof(id: string, projection?: ProjectionType<Proof>, options?: QueryOptions<Proof>): Promise<Proof>;
    _createProof(doc: Proof | any): Promise<Proof>;
    // ============================ END COMMON FUNCTION ============================
}

export const IProofService = Symbol('IProofService');
