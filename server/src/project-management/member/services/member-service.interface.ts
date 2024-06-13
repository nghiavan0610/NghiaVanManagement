import { FilterQuery, ProjectionType, QueryOptions, UpdateQuery } from 'mongoose';
import { Member } from '../schemas/member.schema';

export interface IMemberService {
    // ============================ START COMMON FUNCTION ============================
    _deleteManyMember(filter: FilterQuery<Member>, options?: any): Promise<{ deletedCount: number }>;
    _findOneAndUpdateMember(
        filter: FilterQuery<Member>,
        update?: UpdateQuery<Member>,
        options?: QueryOptions<Member>,
    ): Promise<Member>;
    _createMember(doc: Member | any): Promise<Member>;
    _findOneMember(
        filter: FilterQuery<Member>,
        projection?: ProjectionType<Member>,
        options?: QueryOptions<Member>,
    ): Promise<Member>;
    _findAllMember(
        filter: FilterQuery<Member>,
        projection?: ProjectionType<Member>,
        options?: QueryOptions<Member>,
    ): Promise<Member[]>;
    // ============================ END COMMON FUNCTION ============================
}

export const IMemberService = Symbol('IMemberService');
