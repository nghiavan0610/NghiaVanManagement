import { Inject, Injectable } from '@nestjs/common';
import { IMemberService } from './member-service.interface';
import { ILoggerService } from '@/shared/modules/logger/services/logger-service.interface';
import { MemberRepository } from '../repositories/member.repository';
import { Member } from '../schemas/member.schema';
import { FilterQuery, ProjectionType, QueryOptions, UpdateQuery } from 'mongoose';

@Injectable()
export class MemberService implements IMemberService {
    constructor(
        private readonly memberRepository: MemberRepository,
        @Inject(ILoggerService) private readonly logger: ILoggerService,
    ) {}

    // ============================ START COMMON FUNCTION ============================
    async _deleteManyMember(filter: FilterQuery<Member>, options?: any): Promise<{ deletedCount: number }> {
        return this.memberRepository.deleteMany(filter, options);
    }

    async _findOneAndUpdateMember(
        filter: FilterQuery<Member>,
        update?: UpdateQuery<Member>,
        options?: QueryOptions<Member>,
    ): Promise<Member> {
        return this.memberRepository.findOneAndUpdate(filter, update, options);
    }

    async _createMember(doc: Member | any): Promise<Member> {
        return this.memberRepository.create(doc);
    }

    async _findOneMember(
        filter: FilterQuery<Member>,
        projection?: ProjectionType<Member>,
        options?: QueryOptions<Member>,
    ): Promise<Member> {
        return this.memberRepository.findOne(filter, projection, options);
    }

    async _findAllMember(
        filter: FilterQuery<Member>,
        projection?: ProjectionType<Member>,
        options?: QueryOptions<Member>,
    ): Promise<Member[]> {
        return this.memberRepository.findAll(filter, projection, options);
    }
    // ============================ END COMMON FUNCTION ============================
}
