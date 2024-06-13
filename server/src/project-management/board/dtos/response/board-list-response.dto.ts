import { IResponse } from '@/shared/interfaces/response.interface';
import { Expose, Type } from 'class-transformer';
import { BoardDetailResponseDataDto } from './board-detail-response.dto';

@Expose()
export class BoardListResponseDto implements IResponse<BoardDetailResponseDataDto[]> {
    success = true;

    @Type(() => BoardDetailResponseDataDto)
    data: BoardDetailResponseDataDto[];

    constructor(partial: BoardDetailResponseDataDto[]) {
        this.data = partial;
        // this.data = new BoardDetailResponseDataDto(partial);
    }
}
