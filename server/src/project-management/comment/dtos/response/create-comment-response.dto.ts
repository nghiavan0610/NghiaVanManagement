import { IResponse } from '@/shared/interfaces/response.interface';
import { Expose, Type } from 'class-transformer';
import { CommentDetailResponseDataDto } from './comment-detail-response.dto';

@Expose()
export class CreateCommentResponseDto implements IResponse<CommentDetailResponseDataDto> {
    success = true;

    @Type(() => CommentDetailResponseDataDto)
    data: CommentDetailResponseDataDto;

    constructor(partial: CommentDetailResponseDataDto) {
        this.data = partial;
        // this.data = new CommentDetailResponseDataDto(partial);
    }
}
