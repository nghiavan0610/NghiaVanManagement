import { ILoggerService } from '@/shared/modules/logger/services/logger-service.interface';
import { Inject, Injectable } from '@nestjs/common';
// import { comments } from 'db/devData';
import { CommentRepository } from '../repositories/comment.repository';

@Injectable()
export class CommentSeeder {
    constructor(
        @Inject(ILoggerService) private readonly logger: ILoggerService,
        private readonly commentRepository: CommentRepository,
    ) {}

    async seedUp(): Promise<void> {
        this.logger.info('[COMMENT SEEDING UP]');

        // const processedComments = comments.map((comment: any) => {
        //     const processField = (key: string, value: any) => {
        //         if (value?.$oid) {
        //             return value.$oid;
        //         }
        //         if (Array.isArray(value)) {
        //             return value.map((item: any) => processField('', item));
        //         }
        //         if (value?.$date) {
        //             return new Date(value.$date);
        //         }
        //         return value;
        //     };

        //     const processedComment: any = { ...comment };
        //     Object.keys(processedComment).forEach((key) => {
        //         processedComment[key] = processField(key, processedComment[key]);
        //     });
        //     return processedComment;
        // });

        // await this.commentRepository.insertMany(processedComments);
    }

    async seedDown(): Promise<void> {
        this.logger.info('[COMMENT SEEDING DOWN]');

        await this.commentRepository.collectionDrop();
    }
}
