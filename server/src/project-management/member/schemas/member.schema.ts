import { User } from '@/user/schemas/user.schema';
import { SchemaFactory, Schema, Prop } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import mongoose, { HydratedDocument } from 'mongoose';

export type MemberDocument = HydratedDocument<Member>;

export enum MemberRole {
    manager = 'manager',
    member = 'member',
    support = 'support',
}

@Schema()
export class Member {
    _id: mongoose.Types.ObjectId;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    })
    @Type(() => User)
    user: User;

    @Prop({ type: String, enum: MemberRole })
    role: MemberRole;
}

export const MemberSchema = SchemaFactory.createForClass(Member);

MemberSchema.index({ user: 1, role: 1 }, { unique: true });
