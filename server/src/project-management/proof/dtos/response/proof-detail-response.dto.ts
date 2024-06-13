import { MemberDetailResponseDataDto } from '@/project-management/member/dtos/response/member-detail-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import mongoose from 'mongoose';

export class ProofDetailResponseDataDto {
    @ApiProperty()
    @Expose()
    @Transform(({ value }) => value && value.toString(), { toPlainOnly: true })
    _id: mongoose.Types.ObjectId;

    @ApiProperty()
    @Expose()
    name: string;

    @ApiProperty()
    @Expose()
    url: string;

    @ApiProperty()
    @Expose()
    @Type(() => Boolean)
    isApproved: boolean;

    @ApiProperty()
    @Expose()
    @Type(() => MemberDetailResponseDataDto)
    author: MemberDetailResponseDataDto;

    constructor(partial: Partial<ProofDetailResponseDataDto>) {
        Object.assign(this, partial);
    }
}
