import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ICommentService } from './comment-service.interface';
import { CreateCommentDto } from '../dtos/request/create-comment.dto';
import { CommentRepository } from '../repositories/comment.repository';
import { ILoggerService } from '@/shared/modules/logger/services/logger-service.interface';
import { IBoardService } from '@/project-management/board/services/board-service.interface';
import { BoardError } from '@/project-management/board/enums/board-error.enum';
import { CustomException } from '@/shared/exceptions/custom.exception';
import { IMemberService } from '@/project-management/member/services/member-service.interface';
import { MemberRole } from '@/project-management/member/schemas/member.schema';

@Injectable()
export class CommentService implements ICommentService {
    constructor(
        private readonly commentRepository: CommentRepository,
        @Inject(ILoggerService) private readonly logger: ILoggerService,
        @Inject(IBoardService) private readonly boardService: IBoardService,
        @Inject(IMemberService) private readonly memberService: IMemberService,
    ) {}

    // [POST] /comments
    async createComment(createCommentDto: CreateCommentDto): Promise<boolean> {
        this.logger.info('[CREATE COMMENT], createCommentDto', createCommentDto);

        const { userId, boardId, content } = createCommentDto;

        // Check existed board
        const board = await this.boardService._findByIdBoard(boardId, null, {
            populate: {
                path: 'project',
                populate: 'members',
            },
        });
        if (!board) {
            throw new CustomException({
                message: BoardError.BOARD_NOT_FOUND,
                statusCode: HttpStatus.NOT_FOUND,
            });
        }

        let member = board.project.members.find((member) => member.user._id.toString() === userId);
        if (!member) {
            member = await this.memberService._findOneAndUpdateMember(
                { user: userId, role: MemberRole.support },
                { user: userId, role: MemberRole.support },
                { upsert: true },
            );
        }

        // Create comment
        const comment = await this.commentRepository.create({
            author: member,
            content,
        });

        // Update comment to relation Board
        await this.boardService._updateOneBoard({ _id: boardId }, { $push: { comments: comment } });

        return true;
    }
}
