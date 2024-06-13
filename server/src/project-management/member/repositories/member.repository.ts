import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoRepository } from '@/shared/modules/mongo/mongo.repository';
import { Model } from 'mongoose';
import { Member } from '../schemas/member.schema';

@Injectable()
export class MemberRepository extends MongoRepository<Member> {
    constructor(@InjectModel(Member.name) private readonly memberRepository: Model<Member>) {
        super(memberRepository);
    }
}
