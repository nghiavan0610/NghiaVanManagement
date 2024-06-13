import { Module } from '@nestjs/common';
import { CommentController } from './controllers/comment.controller';
import { CommentServiceProvider } from './providers/comment-service.provider';
import { ICommentService } from './services/comment-service.interface';
import { CommentRepository } from './repositories/comment.repository';
import { CommentSeeder } from './seeders/comment.seeder';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { BoardModule } from '../board/board.module';
import { MemberModule } from '../member/member.module';

@Module({
    imports: [MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]), BoardModule, MemberModule],
    controllers: [CommentController],
    providers: [CommentServiceProvider, CommentRepository, CommentSeeder],
    exports: [ICommentService, CommentSeeder],
})
export class CommentModule {}
