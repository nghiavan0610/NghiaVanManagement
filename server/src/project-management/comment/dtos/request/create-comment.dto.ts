import { BoardError } from '@/project-management/board/enums/board-error.enum';
import { CommentError } from '@/project-management/comment/enums/comment-error.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
    userId: string;

    @ApiProperty()
    @IsNotEmpty({ message: BoardError.BOARD_ID_EMPTY })
    boardId: string;

    @ApiProperty()
    @IsNotEmpty({ message: CommentError.COMMENT_CONTENT_EMPTY })
    content: string;
}
