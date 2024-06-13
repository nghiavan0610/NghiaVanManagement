import { MemberDetailResponseDataDto } from '@/project-management/member/dtos/response/member-detail-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import mongoose from 'mongoose';

export class CommentDetailResponseDataDto {
    @ApiProperty()
    @Expose()
    @Transform(({ value }) => value && value.toString(), { toPlainOnly: true })
    _id: mongoose.Types.ObjectId;

    @ApiProperty()
    @Expose()
    content: string;

    @ApiProperty()
    @Expose()
    @Type(() => MemberDetailResponseDataDto)
    author: MemberDetailResponseDataDto;

    @ApiProperty()
    @IsOptional()
    @Expose()
    createdAt?: string | boolean;

    @ApiProperty()
    @IsOptional()
    @Expose()
    updatedAt?: string | boolean;

    constructor(partial: Partial<CommentDetailResponseDataDto>) {
        Object.assign(this, partial);
    }
}
