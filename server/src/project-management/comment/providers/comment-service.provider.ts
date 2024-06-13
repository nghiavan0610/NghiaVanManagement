import { Provider } from '@nestjs/common';
import { ICommentService } from '../services/comment-service.interface';
import { CommentService } from '../services/comment.service';

export const CommentServiceProvider: Provider = {
    provide: ICommentService,
    useClass: CommentService,
};
