import { Comment } from '@/project-management/comment/schemas/comment.schema';
import { Project } from '@/project-management/project/schemas/project.schema';
import { Shift } from '@/shared/enums/shift.enum';
import { Proof } from '@/project-management/proof/schemas/proof.schema';
import { SchemaFactory, Schema, Prop } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import mongoose, { HydratedDocument } from 'mongoose';

export type BoardDocument = HydratedDocument<Board>;

@Schema({
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    },
})
export class Board {
    _id: mongoose.Types.ObjectId;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
    })
    @Type(() => Project)
    project: Project;

    @Prop({
        type: Date,
        default: Date.now(),
    })
    date: Date;

    @Prop({
        type: Number,
        enum: Shift,
    })
    shift: Shift;

    @Prop({
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Proof',
    })
    @Type(() => Proof)
    proofs: Proof[];

    @Prop({
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Comment',
    })
    @Type(() => Comment)
    comments: Comment[];

    @Prop({ type: Boolean, default: false })
    isLocked: boolean;
}

export const BoardSchema = SchemaFactory.createForClass(Board);

BoardSchema.index({ project: 1, date: 1, shift: 1 }, { unique: true });
