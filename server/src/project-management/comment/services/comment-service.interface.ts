import { CreateCommentDto } from '../dtos/request/create-comment.dto';

export interface ICommentService {
    createComment(createCommentDto: CreateCommentDto): Promise<boolean>;
    // ============================ START COMMON FUNCTION ============================
    // ============================ END COMMON FUNCTION ============================
}

export const ICommentService = Symbol('ICommentService');
