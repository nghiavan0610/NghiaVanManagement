import { IResponse } from '@/shared/interfaces/response.interface';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import mongoose from 'mongoose';
import { Shift } from '@/shared/enums/shift.enum';
import { CommentDetailResponseDataDto } from '@/project-management/comment/dtos/response/comment-detail-response.dto';
import { ProjectDetailResponseDataDto } from '@/project-management/project/dtos/response/project-detail-response.dto';
import { ProofDetailResponseDataDto } from '@/project-management/proof/dtos/response/proof-detail-response.dto';

export class BoardDetailResponseDataDto {
    @ApiProperty()
    @Expose()
    @Transform(({ value }) => value && value.toString(), { toPlainOnly: true })
    _id: mongoose.Types.ObjectId;

    @ApiProperty()
    @Expose()
    @Type(() => ProjectDetailResponseDataDto)
    project: ProjectDetailResponseDataDto;

    @ApiProperty()
    @Expose()
    date: Date;

    @ApiProperty()
    @Expose()
    shift: Shift;

    @ApiProperty()
    @Expose()
    @Type(() => ProofDetailResponseDataDto)
    proofs: ProofDetailResponseDataDto[];

    @ApiProperty()
    @Expose()
    @Type(() => CommentDetailResponseDataDto)
    comments: CommentDetailResponseDataDto[];

    @ApiProperty()
    @Expose()
    isLocked: boolean;

    constructor(partial: Partial<BoardDetailResponseDataDto>) {
        Object.assign(this, partial);
    }
}

@Expose()
export class BoardDetailResponseDto implements IResponse<BoardDetailResponseDataDto> {
    success = true;

    @Type(() => BoardDetailResponseDataDto)
    data: BoardDetailResponseDataDto;

    constructor(partial: BoardDetailResponseDataDto) {
        this.data = partial;
        // this.data = new BoardDetailResponseDataDto(partial);
    }
}
