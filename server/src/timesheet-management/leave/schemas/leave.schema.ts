import { Shift } from '@/shared/enums/shift.enum';
import { User } from '@/user/schemas/user.schema';
import { SchemaFactory, Schema, Prop } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import mongoose, { HydratedDocument } from 'mongoose';

export type LeaveDocument = HydratedDocument<Leave>;

@Schema({
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    },
})
export class Leave {
    _id: mongoose.Types.ObjectId;

    // @Prop({
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Project',
    // })
    // @Type(() => Project)
    // project: Project;

    @Prop({ type: Date })
    date: Date;

    @Prop({
        type: String,
        enum: Shift,
    })
    shift: Shift;

    @Prop({
        type: [mongoose.Schema.Types.ObjectId],
        ref: User.name,
    })
    @Type(() => User)
    users: User[];
}

export const LeaveSchema = SchemaFactory.createForClass(Leave);

LeaveSchema.index({ date: 1, shift: 1 }, { unique: true });
