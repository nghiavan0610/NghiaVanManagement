import { Member } from '@/project-management/member/schemas/member.schema';
import { SchemaFactory, Schema, Prop } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import mongoose, { HydratedDocument } from 'mongoose';

export type ProofDocument = HydratedDocument<Proof>;

@Schema({
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    },
})
export class Proof {
    _id: mongoose.Types.ObjectId;

    @Prop({ type: String })
    name: string;

    @Prop({ type: String })
    url: string;

    @Prop({ type: Boolean, default: false })
    isApproved: boolean;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
    })
    @Type(() => Member)
    author: Member;
}

export const ProofSchema = SchemaFactory.createForClass(Proof);
