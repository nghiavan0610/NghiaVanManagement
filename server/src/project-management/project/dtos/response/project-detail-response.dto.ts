import { MemberDetailResponseDataDto } from '@/project-management/member/dtos/response/member-detail-response.dto';
import { IResponse } from '@/shared/interfaces/response.interface';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import mongoose from 'mongoose';

export class ProjectDetailResponseDataDto {
    @ApiProperty()
    @Expose()
    @Transform(({ value }) => value && value.toString(), { toPlainOnly: true })
    _id: mongoose.Types.ObjectId;

    @ApiProperty()
    @Expose()
    name: string;

    @ApiProperty()
    @Expose()
    code: string;

    @ApiProperty()
    @Expose()
    location: string;

    @ApiProperty()
    @Expose()
    description: string;

    @ApiProperty()
    @Expose()
    @Type(() => Date)
    startedAt: Date;

    @ApiProperty()
    @Expose()
    @Type(() => Boolean)
    isDone: boolean;

    @ApiProperty()
    @Expose()
    @Type(() => MemberDetailResponseDataDto)
    members: MemberDetailResponseDataDto[];

    @ApiProperty()
    @IsOptional()
    @Expose()
    progress?: number;

    @ApiProperty()
    @Expose()
    slug: string;

    constructor(partial: Partial<ProjectDetailResponseDataDto>) {
        Object.assign(this, partial);
    }
}

@Expose()
export class ProjectDetailResponseDto implements IResponse<ProjectDetailResponseDataDto> {
    success = true;

    @Type(() => ProjectDetailResponseDataDto)
    data: ProjectDetailResponseDataDto;

    constructor(partial: ProjectDetailResponseDataDto) {
        this.data = partial;
        // this.data = new ProjectDetailResponseDataDto(partial);
    }
}
