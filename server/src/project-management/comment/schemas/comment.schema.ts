import { SchemaFactory, Schema, Prop } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Type } from 'class-transformer';
import { Member } from '@/project-management/member/schemas/member.schema';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    },
})
export class Comment {
    _id: mongoose.Types.ObjectId;

    @Prop({ type: String })
    content: string;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
    })
    @Type(() => Member)
    author: Member;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
